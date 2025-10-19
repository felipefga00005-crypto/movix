package dfe

import "time"

// NFeRequest represents a request to authorize an NFe
type NFeRequest struct {
	Company     CompanyData     `json:"company"`
	Customer    CustomerData    `json:"customer"`
	Items       []NFeItemData   `json:"items"`
	Certificate CertificateData `json:"certificate"`
	Environment string          `json:"environment"` // "producao" ou "homologacao"
	Series      int             `json:"series"`
	Number      int             `json:"number"`
	Model       string          `json:"model"`                  // "55" = NFe, "65" = NFCe
	OperationNature string      `json:"operation_nature"`
	OperationType   int         `json:"operation_type"`         // 1=Saída, 0=Entrada
	Purpose         int         `json:"purpose"`                // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
	ConsumerOperation int       `json:"consumer_operation"`     // 0=Não, 1=Sim
	PresenceIndicator int       `json:"presence_indicator"`     // 1=Presencial, 2=Internet, etc
	Payment         *PaymentData    `json:"payment,omitempty"`
	Transport       *TransportData  `json:"transport,omitempty"`
	AdditionalInfo  string          `json:"additional_info,omitempty"`
}

// CompanyData represents company/emitter data
type CompanyData struct {
	Document              string      `json:"document"`                // CNPJ
	Name                  string      `json:"name"`                    // Razão Social
	TradeName             string      `json:"trade_name"`              // Nome Fantasia
	StateRegistration     string      `json:"state_registration"`      // IE
	MunicipalRegistration string      `json:"municipal_registration,omitempty"` // IM
	TaxRegime             int         `json:"tax_regime"`              // 1=Simples Nacional, 2=Presumido, 3=Real
	Address               AddressData `json:"address"`
	Email                 string      `json:"email"`
	Phone                 string      `json:"phone"`
}

// CustomerData represents customer/recipient data
type CustomerData struct {
	PersonType            string      `json:"person_type"`             // "fisica" ou "juridica"
	Document              string      `json:"document"`                // CPF ou CNPJ
	Name                  string      `json:"name"`
	TradeName             string      `json:"trade_name,omitempty"`
	StateRegistration     string      `json:"state_registration,omitempty"`
	StateRegistrationType string      `json:"state_registration_type"` // "contribuinte", "isento", "nao_contribuinte"
	Address               AddressData `json:"address"`
	Email                 string      `json:"email,omitempty"`
	Phone                 string      `json:"phone,omitempty"`
}

// AddressData represents address information
type AddressData struct {
	Street     string `json:"street"`
	Number     string `json:"number"`
	Complement string `json:"complement,omitempty"`
	District   string `json:"district"`
	City       string `json:"city"`
	CityCode   string `json:"city_code"`   // Código IBGE
	State      string `json:"state"`       // UF
	ZipCode    string `json:"zip_code"`    // CEP
	CountryCode string `json:"country_code"` // 1058 = Brasil
	Country    string `json:"country"`     // Brasil
}

// NFeItemData represents an NFe item
type NFeItemData struct {
	ItemNumber  int     `json:"item_number"`
	Code        string  `json:"code"`
	Description string  `json:"description"`
	NCM         string  `json:"ncm"`
	CFOP        string  `json:"cfop"`
	Unit        string  `json:"unit"`
	Quantity    float64 `json:"quantity"`
	UnitValue   float64 `json:"unit_value"`
	TotalValue  float64 `json:"total_value"`
	Barcode     string  `json:"barcode,omitempty"`
	CEST        string  `json:"cest,omitempty"`
	Origin      int     `json:"origin"` // 0-8
	Tax         TaxData `json:"tax"`
}

// TaxData represents tax information for an item
type TaxData struct {
	ICMS   ICMSData   `json:"icms"`
	IPI    *IPIData   `json:"ipi,omitempty"`
	PIS    PISData    `json:"pis"`
	COFINS COFINSData `json:"cofins"`
}

// ICMSData represents ICMS tax data
type ICMSData struct {
	CST      string  `json:"cst"`       // Código de Situação Tributária
	BaseCalc float64 `json:"base_calc"`
	Rate     float64 `json:"rate"`
	Value    float64 `json:"value"`
	CSOSN    int     `json:"csosn"` // Para Simples Nacional
}

// IPIData represents IPI tax data
type IPIData struct {
	CST      string  `json:"cst"`
	BaseCalc float64 `json:"base_calc"`
	Rate     float64 `json:"rate"`
	Value    float64 `json:"value"`
}

// PISData represents PIS tax data
type PISData struct {
	CST      string  `json:"cst"`
	BaseCalc float64 `json:"base_calc"`
	Rate     float64 `json:"rate"`
	Value    float64 `json:"value"`
}

// COFINSData represents COFINS tax data
type COFINSData struct {
	CST      string  `json:"cst"`
	BaseCalc float64 `json:"base_calc"`
	Rate     float64 `json:"rate"`
	Value    float64 `json:"value"`
}

// PaymentData represents payment information
type PaymentData struct {
	Indicator int                 `json:"indicator"` // 0=À vista, 1=A prazo
	Methods   []PaymentMethodData `json:"methods"`
}

// PaymentMethodData represents a payment method
type PaymentMethodData struct {
	Type  string  `json:"type"`  // 01=Dinheiro, 03=Cartão Crédito, etc
	Value float64 `json:"value"`
}

// TransportData represents transport information
type TransportData struct {
	Modality int          `json:"modality"` // 9=Sem frete
	Carrier  *CarrierData `json:"carrier,omitempty"`
	Volumes  []VolumeData `json:"volumes,omitempty"`
}

// CarrierData represents carrier information
type CarrierData struct {
	Document          string `json:"document,omitempty"`
	Name              string `json:"name,omitempty"`
	StateRegistration string `json:"state_registration,omitempty"`
	Address           string `json:"address,omitempty"`
	City              string `json:"city,omitempty"`
	State             string `json:"state,omitempty"`
}

// VolumeData represents volume information
type VolumeData struct {
	Quantity    int     `json:"quantity"`
	Species     string  `json:"species,omitempty"`
	Brand       string  `json:"brand,omitempty"`
	Numbering   string  `json:"numbering,omitempty"`
	GrossWeight float64 `json:"gross_weight,omitempty"`
	NetWeight   float64 `json:"net_weight,omitempty"`
}

// CertificateData represents digital certificate data
type CertificateData struct {
	Content  []byte `json:"content"`  // Arquivo .pfx em bytes
	Password string `json:"password"`
}

// NFeResponse represents the response from NFe authorization
type NFeResponse struct {
	Success      bool      `json:"success"`
	Message      string    `json:"message"`
	AccessKey    string    `json:"access_key,omitempty"`
	Protocol     string    `json:"protocol,omitempty"`
	XML          string    `json:"xml,omitempty"`
	StatusCode   string    `json:"status_code,omitempty"`
	AuthorizedAt *time.Time `json:"authorized_at,omitempty"`
	Errors       []string  `json:"errors,omitempty"`
}

// CancelNFeRequest represents a request to cancel an NFe
type CancelNFeRequest struct {
	AccessKey   string          `json:"access_key"`
	Reason      string          `json:"reason"`
	Protocol    string          `json:"protocol"`
	Certificate CertificateData `json:"certificate"`
	Environment string          `json:"environment"`
}

// CancelNFeResponse represents the response from NFe cancellation
type CancelNFeResponse struct {
	Success              bool       `json:"success"`
	Message              string     `json:"message"`
	CancellationProtocol string     `json:"cancellation_protocol,omitempty"`
	XML                  string     `json:"xml,omitempty"`
	CancelledAt          *time.Time `json:"cancelled_at,omitempty"`
	Errors               []string   `json:"errors,omitempty"`
}

// StatusServiceRequest represents a request to check SEFAZ service status
type StatusServiceRequest struct {
	State       string          `json:"state"` // UF
	Environment string          `json:"environment"`
	Certificate CertificateData `json:"certificate"`
}

// StatusServiceResponse represents the response from service status check
type StatusServiceResponse struct {
	Success           bool       `json:"success"`
	Message           string     `json:"message"`
	StatusCode        string     `json:"status_code,omitempty"`
	StatusDescription string     `json:"status_description,omitempty"`
	ResponseTime      *time.Time `json:"response_time,omitempty"`
}

// DanfeRequest represents a request to generate DANFE
type DanfeRequest struct {
	XML    string `json:"xml"`
	Format string `json:"format"` // "pdf" ou "html"
}

// DanfeResponse represents the response from DANFE generation
type DanfeResponse struct {
	Success     bool     `json:"success"`
	Message     string   `json:"message"`
	Content     []byte   `json:"content,omitempty"`
	ContentType string   `json:"content_type,omitempty"`
	Errors      []string `json:"errors,omitempty"`
}

