package services

import (
	"fmt"
	"time"

	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/pkg/dfe"
)

// DFeService handles integration with DFe microservice
type DFeService struct {
	client      *dfe.Client
	companyRepo *repositories.CompanyRepository
	certRepo    *repositories.CertificateRepository
	certService *CertificateService
}

// NewDFeService creates a new DFe service
func NewDFeService(
	baseURL string,
	timeout time.Duration,
	companyRepo *repositories.CompanyRepository,
	certRepo *repositories.CertificateRepository,
	certService *CertificateService,
) *DFeService {
	return &DFeService{
		client:      dfe.NewClient(baseURL, timeout),
		companyRepo: companyRepo,
		certRepo:    certRepo,
		certService: certService,
	}
}

// AuthorizeNFe authorizes an NFe via DFe microservice
func (s *DFeService) AuthorizeNFe(nfe *models.NFe, company *models.Company) (*dfe.NFeResponse, error) {
	// Load certificate
	cert, err := s.loadCertificate(company)
	if err != nil {
		return nil, fmt.Errorf("failed to load certificate: %w", err)
	}

	// Convert NFe to DFe request
	req, err := s.convertNFeToDFeRequest(nfe, company, cert)
	if err != nil {
		return nil, fmt.Errorf("failed to convert NFe: %w", err)
	}

	// Call DFe service
	return s.client.AuthorizeNFe(req)
}

// CancelNFe cancels an NFe via DFe microservice
func (s *DFeService) CancelNFe(nfe *models.NFe, company *models.Company, reason string) (*dfe.CancelNFeResponse, error) {
	// Load certificate
	cert, err := s.loadCertificate(company)
	if err != nil {
		return nil, fmt.Errorf("failed to load certificate: %w", err)
	}

	// Create cancel request
	req := &dfe.CancelNFeRequest{
		AccessKey:   nfe.AccessKey,
		Reason:      reason,
		Protocol:    nfe.Protocol,
		Certificate: *cert,
		Environment: string(company.Environment),
	}

	// Call DFe service
	return s.client.CancelNFe(req)
}

// CheckServiceStatus checks SEFAZ service status
func (s *DFeService) CheckServiceStatus(company *models.Company) (*dfe.StatusServiceResponse, error) {
	// Load certificate
	cert, err := s.loadCertificate(company)
	if err != nil {
		return nil, fmt.Errorf("failed to load certificate: %w", err)
	}

	// Create status request
	req := &dfe.StatusServiceRequest{
		State:       company.Address.State,
		Environment: string(company.Environment),
		Certificate: *cert,
	}

	// Call DFe service
	return s.client.CheckServiceStatus(req)
}

// loadCertificate loads and decrypts the company's certificate
func (s *DFeService) loadCertificate(company *models.Company) (*dfe.CertificateData, error) {
	if company.CertificateID == nil {
		return nil, fmt.Errorf("company does not have a certificate")
	}

	cert, err := s.certRepo.FindByID(*company.CertificateID)
	if err != nil {
		return nil, fmt.Errorf("certificate not found: %w", err)
	}

	if !cert.IsActive() {
		return nil, fmt.Errorf("certificate is not active or expired")
	}

	// Decrypt certificate content and password using CertificateService
	content, password, err := s.certService.GetDecryptedCertificate(cert.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt certificate: %w", err)
	}

	return &dfe.CertificateData{
		Content:  content,
		Password: password,
	}, nil
}

// convertNFeToDFeRequest converts internal NFe model to DFe request
func (s *DFeService) convertNFeToDFeRequest(nfe *models.NFe, company *models.Company, cert *dfe.CertificateData) (*dfe.NFeRequest, error) {
	// Convert company data
	companyData := dfe.CompanyData{
		Document:              company.Document,
		Name:                  company.LegalName,
		TradeName:             company.TradeName,
		StateRegistration:     company.StateRegistration,
		MunicipalRegistration: company.MunicipalRegistration,
		TaxRegime:             s.convertTaxRegime(company.TaxRegime),
		Address:               s.convertAddress(company.Address),
		Email:                 company.Email,
		Phone:                 company.Phone,
	}

	// Convert customer data
	if nfe.Customer == nil {
		return nil, fmt.Errorf("NFe customer is required")
	}
	customerData := s.convertCustomer(*nfe.Customer)

	// Convert items
	items := make([]dfe.NFeItemData, len(nfe.Items))
	for i, item := range nfe.Items {
		items[i] = s.convertItem(item, i+1)
	}

	// Convert payment data
	var paymentData *dfe.PaymentData
	if len(nfe.Payments) > 0 {
		paymentData = s.convertPayment(nfe.Payments, nfe.PaymentIndicator)
	}

	// Convert transport data
	var transportData *dfe.TransportData
	if nfe.FreightMode != models.FreightModeNone {
		transportData = s.convertTransport(nfe)
	}

	// Create request
	req := &dfe.NFeRequest{
		Company:           companyData,
		Customer:          customerData,
		Items:             items,
		Certificate:       *cert,
		Environment:       string(company.Environment),
		Series:            nfe.Series,
		Number:            nfe.Number,
		Model:             nfe.Model,
		OperationNature:   nfe.OperationNature,
		OperationType:     s.convertNFeType(nfe.Type),
		Purpose:           int(nfe.Purpose),
		ConsumerOperation: int(nfe.ConsumerOperation),
		PresenceIndicator: int(nfe.PresenceIndicator),
		Payment:           paymentData,
		Transport:         transportData,
		AdditionalInfo:    nfe.AdditionalInfo,
	}

	return req, nil
}

// convertTaxRegime converts tax regime to int
func (s *DFeService) convertTaxRegime(regime models.TaxRegime) int {
	switch regime {
	case models.TaxRegimeSimples:
		return 1
	case models.TaxRegimePresumido:
		return 2
	case models.TaxRegimeReal:
		return 3
	case models.TaxRegimeMEI:
		return 1 // MEI usa Simples Nacional
	default:
		return 1
	}
}

// convertAddress converts address model to DFe format
func (s *DFeService) convertAddress(addr models.Address) dfe.AddressData {
	return dfe.AddressData{
		Street:      addr.Street,
		Number:      addr.Number,
		Complement:  addr.Complement,
		District:    addr.District,
		City:        addr.City,
		CityCode:    addr.CityCode,
		State:       addr.State,
		ZipCode:     addr.ZipCode,
		CountryCode: addr.CountryCode,
		Country:     addr.Country,
	}
}

// convertCustomer converts customer model to DFe format
func (s *DFeService) convertCustomer(customer models.Customer) dfe.CustomerData {
	personType := "juridica"
	if customer.PersonType == models.PersonTypeIndividual {
		personType = "fisica"
	}

	stateRegType := "nao_contribuinte"
	if customer.StateRegistrationType == models.StateRegistrationTypeContributor {
		stateRegType = "contribuinte"
	} else if customer.StateRegistrationType == models.StateRegistrationTypeExempt {
		stateRegType = "isento"
	}

	return dfe.CustomerData{
		PersonType:            personType,
		Document:              customer.Document,
		Name:                  customer.Name,
		TradeName:             customer.TradeName,
		StateRegistration:     customer.StateRegistration,
		StateRegistrationType: stateRegType,
		Address: dfe.AddressData{
			Street:      customer.Street,
			Number:      customer.Number,
			Complement:  customer.Complement,
			District:    customer.District,
			City:        customer.City,
			CityCode:    customer.CityCode,
			State:       customer.State,
			ZipCode:     customer.ZipCode,
			CountryCode: customer.CountryCode,
			Country:     customer.Country,
		},
		Email: customer.Email,
		Phone: customer.Phone,
	}
}

// convertItem converts NFe item to DFe format
func (s *DFeService) convertItem(item models.NFeItem, itemNumber int) dfe.NFeItemData {
	return dfe.NFeItemData{
		ItemNumber:  itemNumber,
		Code:        item.Code,
		Description: item.Description,
		NCM:         item.NCM,
		CFOP:        item.CFOP,
		Unit:        item.CommercialUnit,
		Quantity:    item.CommercialQuantity,
		UnitValue:   item.CommercialUnitPrice,
		TotalValue:  item.TotalNet,
		Barcode:     item.Barcode,
		CEST:        item.CEST,
		Origin:      item.ICMSOrigin,
		Tax: dfe.TaxData{
			ICMS: dfe.ICMSData{
				CST:      item.ICMSCST,
				BaseCalc: item.ICMSBaseCalc,
				Rate:     item.ICMSRate,
				Value:    item.ICMSValue,
				CSOSN:    convertCSOSNToInt(item.ICMSCSOSN),
			},
			PIS: dfe.PISData{
				CST:      item.PISCST,
				BaseCalc: item.PISBaseCalc,
				Rate:     item.PISRate,
				Value:    item.PISValue,
			},
			COFINS: dfe.COFINSData{
				CST:      item.COFINSCST,
				BaseCalc: item.COFINSBaseCalc,
				Rate:     item.COFINSRate,
				Value:    item.COFINSValue,
			},
		},
	}
}

// convertPayment converts payment data to DFe format
func (s *DFeService) convertPayment(payments []models.NFePayment, indicator models.PaymentIndicator) *dfe.PaymentData {
	if len(payments) == 0 {
		return nil
	}

	methods := make([]dfe.PaymentMethodData, len(payments))
	for i, payment := range payments {
		methods[i] = dfe.PaymentMethodData{
			Type:  string(payment.Method),
			Value: payment.Value,
		}
	}

	return &dfe.PaymentData{
		Indicator: int(indicator),
		Methods:   methods,
	}
}

// convertTransport converts transport data to DFe format
func (s *DFeService) convertTransport(nfe *models.NFe) *dfe.TransportData {
	transport := &dfe.TransportData{
		Modality: int(nfe.FreightMode),
	}

	// Add carrier if exists
	if nfe.Carrier != nil {
		address := fmt.Sprintf("%s, %s - %s", nfe.Carrier.Street, nfe.Carrier.Number, nfe.Carrier.District)
		transport.Carrier = &dfe.CarrierData{
			Document:          nfe.Carrier.Document,
			Name:              nfe.Carrier.Name,
			StateRegistration: nfe.Carrier.StateRegistration,
			Address:           address,
			City:              nfe.Carrier.City,
			State:             nfe.Carrier.State,
		}
	}

	// Add volumes if exists
	if len(nfe.Volumes) > 0 {
		volumes := make([]dfe.VolumeData, len(nfe.Volumes))
		for i, vol := range nfe.Volumes {
			volumes[i] = dfe.VolumeData{
				Quantity:    vol.Quantity,
				Species:     vol.Species,
				Brand:       vol.Brand,
				Numbering:   vol.Numbering,
				GrossWeight: vol.GrossWeight,
				NetWeight:   vol.NetWeight,
			}
		}
		transport.Volumes = volumes
	}

	return transport
}

// convertNFeType converts NFeType to int for DFe service
func (s *DFeService) convertNFeType(nfeType models.NFeType) int {
	// 0 = Entrada, 1 = Saída
	// Para NFe, geralmente é saída (1)
	return 1
}

// convertCSOSNToInt converts CSOSN string to int
func convertCSOSNToInt(csosn string) int {
	if csosn == "" {
		return 0
	}
	// Convert string to int (e.g., "102" -> 102)
	var result int
	fmt.Sscanf(csosn, "%d", &result)
	return result
}
