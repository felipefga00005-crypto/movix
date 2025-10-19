package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/internal/validators"
	appErrors "github.com/movix/backend/pkg/errors"
)

// NFeService handles NFe business logic
type NFeService struct {
	nfeRepo         *repositories.NFeRepository
	companyRepo     *repositories.CompanyRepository
	accountRepo     *repositories.AccountRepository
	dfeService      *DFeService // DFe microservice integration
	taxCalculator   *TaxCalculatorService
	fiscalValidator *validators.FiscalValidator
	errorMapper     *SefazErrorMapper
}

// NewNFeService creates a new NFe service
func NewNFeService(
	nfeRepo *repositories.NFeRepository,
	companyRepo *repositories.CompanyRepository,
	accountRepo *repositories.AccountRepository,
	dfeService *DFeService,
	taxCalculator *TaxCalculatorService,
	fiscalValidator *validators.FiscalValidator,
) *NFeService {
	return &NFeService{
		nfeRepo:         nfeRepo,
		companyRepo:     companyRepo,
		accountRepo:     accountRepo,
		dfeService:      dfeService,
		taxCalculator:   taxCalculator,
		fiscalValidator: fiscalValidator,
		errorMapper:     NewSefazErrorMapper(),
	}
}

// CreateNFeRequest represents a request to create an NFe
type CreateNFeRequest struct {
	CompanyID uuid.UUID         `json:"company_id" binding:"required"`
	Customer  models.Customer   `json:"customer" binding:"required"`
	Items     []models.NFeItem  `json:"items" binding:"required,min=1"`
}

// NFeResponse represents an NFe in responses
type NFeResponse struct {
	ID            uuid.UUID         `json:"id"`
	CompanyID     uuid.UUID         `json:"company_id"`
	UserID        uuid.UUID         `json:"user_id"`
	Number        int               `json:"number"`
	Series        int               `json:"series"`
	Model         string            `json:"model"`
	Customer      models.Customer   `json:"customer"`
	Items         []models.NFeItem  `json:"items"`
	TotalProducts float64           `json:"total_products"`
	TotalNFe      float64           `json:"total_nfe"`
	Status        models.NFeStatus  `json:"status"`
	AccessKey     string            `json:"access_key,omitempty"`
	Protocol      string            `json:"protocol,omitempty"`
	IssuedAt      *time.Time        `json:"issued_at,omitempty"`
	AuthorizedAt  *time.Time        `json:"authorized_at,omitempty"`
	CancelledAt   *time.Time        `json:"cancelled_at,omitempty"`
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
}

// CreateDraft creates a new NFe draft
func (s *NFeService) CreateDraft(userID uuid.UUID, req CreateNFeRequest) (*NFeResponse, error) {
	// Validate company exists
	company, err := s.companyRepo.FindByID(req.CompanyID)
	if err != nil {
		return nil, appErrors.ErrCompanyNotFound
	}

	// Validate company is active
	if company.Status != models.CompanyStatusActive {
		return nil, errors.New("company is not active")
	}

	// Validate company data
	if err := s.validateCompanyData(company); err != nil {
		return nil, fmt.Errorf("invalid company data: %w", err)
	}

	// Validate customer data
	if err := s.validateCustomerData(&req.Customer); err != nil {
		return nil, fmt.Errorf("invalid customer data: %w", err)
	}

	// Validate items
	for i, item := range req.Items {
		if err := s.validateItemData(&item); err != nil {
			return nil, fmt.Errorf("invalid item %d: %w", i+1, err)
		}
	}

	// Calculate taxes for each item automatically
	isConsumerFinal := req.Customer.PersonType == models.PersonTypeIndividual
	for i := range req.Items {
		if err := s.taxCalculator.CalculateTaxesForItem(
			&req.Items[i],
			company,
			req.Customer.State,
			isConsumerFinal,
		); err != nil {
			return nil, fmt.Errorf("failed to calculate taxes for item %d: %w", i+1, err)
		}
	}

	// Calculate totals
	totalProducts := 0.0
	totalICMS := 0.0
	totalPIS := 0.0
	totalCOFINS := 0.0
	totalIPI := 0.0

	for _, item := range req.Items {
		totalProducts += item.TotalNet
		totalICMS += item.ICMSValue
		totalPIS += item.PISValue
		totalCOFINS += item.COFINSValue
		totalIPI += item.IPIValue
	}

	totalNFe := totalProducts + totalIPI

	// Get next NFe number
	nextNumber := company.NextNFeNumber

	// Create NFe
	nfe := &models.NFe{
		CompanyID:     req.CompanyID,
		UserID:        userID,
		Number:        nextNumber,
		Series:        company.NFeSeries,
		Model:         "55", // NFe
		Customer:      &req.Customer,
		Items:         req.Items,
		TotalProducts: totalProducts,
		TotalICMS:     totalICMS,
		TotalPIS:      totalPIS,
		TotalCOFINS:   totalCOFINS,
		TotalIPI:      totalIPI,
		TotalNFe:      totalNFe,
		Status:        models.NFeStatusDraft,
	}

	if err := s.nfeRepo.Create(nfe); err != nil {
		return nil, errors.New("failed to create NFe")
	}

	// Increment company NFe number for next draft
	company.NextNFeNumber++
	s.companyRepo.Update(company)

	return s.toNFeResponse(nfe), nil
}

// AuthorizeNFe authorizes an NFe with SEFAZ
func (s *NFeService) AuthorizeNFe(nfeID uuid.UUID) (*NFeResponse, error) {
	// Get NFe
	nfe, err := s.nfeRepo.FindByID(nfeID)
	if err != nil {
		return nil, appErrors.ErrNFeNotFound
	}

	// Validate status
	if nfe.Status != models.NFeStatusDraft {
		return nil, errors.New("NFe must be in draft status to authorize")
	}

	// Get company
	company, err := s.companyRepo.FindByID(nfe.CompanyID)
	if err != nil {
		return nil, appErrors.ErrCompanyNotFound
	}

	// Validate limits
	if err := s.ValidateLimits(company); err != nil {
		return nil, err
	}

	// Send to SEFAZ via DFe microservice
	response, err := s.dfeService.AuthorizeNFe(nfe, company)
	if err != nil {
		// Update status to rejected with error info
		nfe.Status = models.NFeStatusRejected
		nfe.StatusCode = "999"
		nfe.RejectionReason = s.errorMapper.FormatError("999", err.Error())
		s.nfeRepo.Update(nfe)
		return nil, fmt.Errorf("failed to send NFe: %v", err)
	}

	// Process response
	if response.Success {
		// Update NFe with authorization data
		now := time.Now()
		nfe.Status = models.NFeStatusAuthorized
		nfe.AccessKey = response.AccessKey
		nfe.Protocol = response.Protocol
		nfe.XML = response.XML
		nfe.StatusCode = response.StatusCode
		nfe.IssuedAt = &now
		nfe.AuthorizedAt = &now

		// Increment company NFe number
		company.NextNFeNumber++
		s.companyRepo.Update(company)
	} else {
		// Update status to rejected with SEFAZ error info
		nfe.Status = models.NFeStatusRejected
		nfe.StatusCode = response.StatusCode
		nfe.RejectionReason = s.errorMapper.FormatError(response.StatusCode, response.Message)
	}

	if err := s.nfeRepo.Update(nfe); err != nil {
		return nil, errors.New("failed to update NFe")
	}

	if !response.Success {
		return nil, fmt.Errorf("NFe rejected: %s", response.Message)
	}

	return s.toNFeResponse(nfe), nil
}

// CancelNFe cancels an authorized NFe
func (s *NFeService) CancelNFe(nfeID uuid.UUID, justificativa string) (*NFeResponse, error) {
	// Get NFe
	nfe, err := s.nfeRepo.FindByID(nfeID)
	if err != nil {
		return nil, appErrors.ErrNFeNotFound
	}

	// Validate status
	if nfe.Status != models.NFeStatusAuthorized {
		return nil, errors.New("only authorized NFe can be cancelled")
	}

	// Validate justification
	if len(justificativa) < 15 {
		return nil, errors.New("justification must have at least 15 characters")
	}

	// Validate cancellation deadline (24 hours)
	if nfe.AuthorizedAt != nil {
		deadline := nfe.AuthorizedAt.Add(24 * time.Hour)
		if time.Now().After(deadline) {
			return nil, errors.New("NFe can only be cancelled within 24 hours of authorization")
		}
	}

	// Get company
	company, err := s.companyRepo.FindByID(nfe.CompanyID)
	if err != nil {
		return nil, appErrors.ErrCompanyNotFound
	}

	// Cancel via DFe microservice
	response, err := s.dfeService.CancelNFe(nfe, company, justificativa)
	if err != nil {
		return nil, fmt.Errorf("failed to cancel NFe: %v", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("cancellation rejected: %s", response.Message)
	}

	// Update NFe
	now := time.Now()
	nfe.Status = models.NFeStatusCancelled
	nfe.CancelledAt = &now
	nfe.CancellationReason = justificativa

	if err := s.nfeRepo.Update(nfe); err != nil {
		return nil, errors.New("failed to update NFe")
	}

	return s.toNFeResponse(nfe), nil
}

// GetNFeByID returns an NFe by ID
func (s *NFeService) GetNFeByID(id uuid.UUID) (*NFeResponse, error) {
	nfe, err := s.nfeRepo.FindByID(id)
	if err != nil {
		return nil, appErrors.ErrNFeNotFound
	}

	return s.toNFeResponse(nfe), nil
}

// ListNFes lists NFes with filters and pagination
func (s *NFeService) ListNFes(companyID *uuid.UUID, status *models.NFeStatus, page, perPage int) ([]*NFeResponse, int64, error) {
	filters := repositories.NFeListFilters{
		CompanyID: companyID,
		Status:    status,
	}

	nfes, total, err := s.nfeRepo.List(filters, page, perPage)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]*NFeResponse, len(nfes))
	for i, nfe := range nfes {
		responses[i] = s.toNFeResponse(&nfe)
	}

	return responses, total, nil
}

// DownloadXML returns the XML of an authorized NFe
func (s *NFeService) DownloadXML(id uuid.UUID) (string, error) {
	nfe, err := s.nfeRepo.FindByID(id)
	if err != nil {
		return "", appErrors.ErrNFeNotFound
	}

	if nfe.Status != models.NFeStatusAuthorized && nfe.Status != models.NFeStatusCancelled {
		return "", errors.New("XML is only available for authorized or cancelled NFe")
	}

	if nfe.XML == "" {
		return "", errors.New("XML not available")
	}

	return nfe.XML, nil
}

// ValidateLimits validates if the company can issue more NFes
func (s *NFeService) ValidateLimits(company *models.Company) error {
	// Get account
	account, err := s.accountRepo.FindByID(company.AccountID)
	if err != nil {
		return appErrors.ErrAccountNotFound
	}

	// Check if account is active
	if account.Status != models.AccountStatusActive {
		return errors.New("account is not active")
	}

	// Check monthly limit
	if account.MaxNFesPerMonth > 0 {
		// Get current month NFe count
		now := time.Now()

		count, err := s.nfeRepo.CountByCompanyAndMonth(company.ID, now.Year(), int(now.Month()))
		if err != nil {
			return errors.New("failed to check NFe limit")
		}

		if count >= int64(account.MaxNFesPerMonth) {
			return errors.New("monthly NFe limit reached")
		}
	}

	return nil
}

// toNFeResponse converts a models.NFe to NFeResponse
func (s *NFeService) toNFeResponse(nfe *models.NFe) *NFeResponse {
	var customer models.Customer
	if nfe.Customer != nil {
		customer = *nfe.Customer
	}

	return &NFeResponse{
		ID:            nfe.ID,
		CompanyID:     nfe.CompanyID,
		UserID:        nfe.UserID,
		Number:        nfe.Number,
		Series:        nfe.Series,
		Model:         nfe.Model,
		Customer:      customer,
		Items:         nfe.Items,
		TotalProducts: nfe.TotalProducts,
		TotalNFe:      nfe.TotalNFe,
		Status:        nfe.Status,
		AccessKey:     nfe.AccessKey,
		Protocol:      nfe.Protocol,
		IssuedAt:      nfe.IssuedAt,
		AuthorizedAt:  nfe.AuthorizedAt,
		CancelledAt:   nfe.CancelledAt,
		CreatedAt:     nfe.CreatedAt,
		UpdatedAt:     nfe.UpdatedAt,
	}
}

// validateCompanyData validates company fiscal data
func (s *NFeService) validateCompanyData(company *models.Company) error {
	// Validate CNPJ
	if err := s.fiscalValidator.ValidateCNPJ(company.Document); err != nil {
		return fmt.Errorf("CNPJ da empresa inválido: %w", err)
	}

	// Validate State Registration
	if company.StateRegistration != "" && company.StateRegistration != "ISENTO" {
		if err := s.fiscalValidator.ValidateIE(company.StateRegistration, company.Address.State); err != nil {
			return fmt.Errorf("IE da empresa inválida: %w", err)
		}
	}

	// Validate UF
	if err := s.fiscalValidator.ValidateUF(company.Address.State); err != nil {
		return fmt.Errorf("UF da empresa inválida: %w", err)
	}

	// Validate ZIP code
	if err := s.fiscalValidator.ValidateZipCode(company.Address.ZipCode); err != nil {
		return fmt.Errorf("CEP da empresa inválido: %w", err)
	}

	return nil
}

// validateCustomerData validates customer fiscal data
func (s *NFeService) validateCustomerData(customer *models.Customer) error {
	// Validate document (CPF or CNPJ)
	if customer.PersonType == models.PersonTypeIndividual {
		if err := s.fiscalValidator.ValidateCPF(customer.Document); err != nil {
			return fmt.Errorf("CPF do cliente inválido: %w", err)
		}
	} else {
		if err := s.fiscalValidator.ValidateCNPJ(customer.Document); err != nil {
			return fmt.Errorf("CNPJ do cliente inválido: %w", err)
		}
	}

	// Validate State Registration if applicable
	if customer.StateRegistration != "" && customer.StateRegistration != "ISENTO" {
		if err := s.fiscalValidator.ValidateIE(customer.StateRegistration, customer.State); err != nil {
			return fmt.Errorf("IE do cliente inválida: %w", err)
		}
	}

	// Validate UF
	if err := s.fiscalValidator.ValidateUF(customer.State); err != nil {
		return fmt.Errorf("UF do cliente inválida: %w", err)
	}

	// Validate ZIP code
	if err := s.fiscalValidator.ValidateZipCode(customer.ZipCode); err != nil {
		return fmt.Errorf("CEP do cliente inválido: %w", err)
	}

	// Validate email
	if err := s.fiscalValidator.ValidateEmail(customer.Email); err != nil {
		return fmt.Errorf("email do cliente inválido: %w", err)
	}

	// Validate phone
	if err := s.fiscalValidator.ValidatePhone(customer.Phone); err != nil {
		return fmt.Errorf("telefone do cliente inválido: %w", err)
	}

	return nil
}

// validateItemData validates NFe item fiscal data
func (s *NFeService) validateItemData(item *models.NFeItem) error {
	// Validate NCM
	if err := s.fiscalValidator.ValidateNCM(item.NCM); err != nil {
		return fmt.Errorf("NCM inválido: %w", err)
	}

	// Validate CFOP
	if err := s.fiscalValidator.ValidateCFOP(item.CFOP); err != nil {
		return fmt.Errorf("CFOP inválido: %w", err)
	}

	// Validate CEST (optional)
	if item.CEST != "" {
		if err := s.fiscalValidator.ValidateCEST(item.CEST); err != nil {
			return fmt.Errorf("CEST inválido: %w", err)
		}
	}

	// Validate quantities and values
	if item.CommercialQuantity <= 0 {
		return errors.New("quantidade deve ser maior que zero")
	}

	if item.CommercialUnitPrice <= 0 {
		return errors.New("valor unitário deve ser maior que zero")
	}

	if item.TotalNet <= 0 {
		return errors.New("valor total deve ser maior que zero")
	}

	return nil
}
