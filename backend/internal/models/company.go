package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CompanyStatus represents the status of a company
type CompanyStatus string

const (
	CompanyStatusActive   CompanyStatus = "active"
	CompanyStatusInactive CompanyStatus = "inactive"
)

// TaxRegime represents the tax regime of a company
type TaxRegime string

const (
	TaxRegimeSimples   TaxRegime = "simples_nacional"
	TaxRegimePresumido TaxRegime = "lucro_presumido"
	TaxRegimeReal      TaxRegime = "lucro_real"
	TaxRegimeMEI       TaxRegime = "mei"
)

// Environment represents the SEFAZ environment
type Environment string

const (
	EnvironmentProduction  Environment = "producao"
	EnvironmentHomologacao Environment = "homologacao"
)

// Address represents a company address
type Address struct {
	Street      string `json:"street"`
	Number      string `json:"number"`
	Complement  string `json:"complement,omitempty"`
	District    string `json:"district"`
	City        string `json:"city"`
	State       string `json:"state"` // UF
	ZipCode     string `json:"zip_code"`
	CityCode    string `json:"city_code"`    // Código IBGE do município
	CountryCode string `json:"country_code"` // Código do país (1058 = Brasil)
	Country     string `json:"country"`
}

// Scan implements the sql.Scanner interface for Address
func (a *Address) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, a)
}

// Value implements the driver.Valuer interface for Address
func (a Address) Value() (driver.Value, error) {
	return json.Marshal(a)
}

// Company represents a client company (CNPJ)
type Company struct {
	ID                    uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AccountID             uuid.UUID      `gorm:"type:uuid;not null;index" json:"account_id"`
	TradeName             string         `gorm:"type:varchar(255);not null" json:"trade_name"`           // Nome Fantasia
	LegalName             string         `gorm:"type:varchar(255);not null" json:"legal_name"`           // Razão Social
	Document              string         `gorm:"type:varchar(18);uniqueIndex;not null" json:"document"`  // CNPJ
	StateRegistration     string         `gorm:"type:varchar(20)" json:"state_registration"`             // Inscrição Estadual
	MunicipalRegistration string         `gorm:"type:varchar(20)" json:"municipal_registration"`         // Inscrição Municipal
	Address               Address        `gorm:"type:jsonb" json:"address"`
	CNAE                  string         `gorm:"type:varchar(10)" json:"cnae"`                           // Código CNAE
	Phone                 string         `gorm:"type:varchar(20)" json:"phone"`                          // Telefone
	Email                 string         `gorm:"type:varchar(255)" json:"email"`                         // Email
	TaxRegime             TaxRegime      `gorm:"type:varchar(30);not null" json:"tax_regime"`
	Environment           Environment    `gorm:"type:varchar(20);not null;default:'homologacao'" json:"environment"`
	CertificateID         *uuid.UUID     `gorm:"type:uuid;index" json:"certificate_id"`
	NextNFeNumber         int            `gorm:"column:next_nfe_number;not null;default:1" json:"next_nfe_number"`
	NFeSeries             int            `gorm:"column:nfe_series;not null;default:1" json:"nfe_series"`
	NextNFCeNumber        int            `gorm:"column:next_nfce_number;not null;default:1" json:"next_nfce_number"`
	NFCeSeries            int            `gorm:"column:nfce_series;not null;default:1" json:"nfce_series"`
	DefaultAdditionalInfo string         `gorm:"type:text" json:"default_additional_info"` // Informações adicionais padrão
	Status                CompanyStatus  `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt             time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt             time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Account       *Account      `gorm:"foreignKey:AccountID;constraint:OnDelete:CASCADE" json:"account,omitempty"`
	Certificate   *Certificate  `gorm:"foreignKey:CertificateID" json:"certificate,omitempty"`
	UserCompanies []UserCompany `gorm:"foreignKey:CompanyID" json:"user_companies,omitempty"`
	NFes          []NFe         `gorm:"foreignKey:CompanyID" json:"nfes,omitempty"`
}

// TableName specifies the table name for Company model
func (Company) TableName() string {
	return "companies"
}

// BeforeCreate hook to set default values
func (c *Company) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	if c.Status == "" {
		c.Status = CompanyStatusActive
	}
	if c.Environment == "" {
		c.Environment = EnvironmentHomologacao
	}
	if c.NextNFeNumber == 0 {
		c.NextNFeNumber = 1
	}
	if c.NFeSeries == 0 {
		c.NFeSeries = 1
	}
	if c.NextNFCeNumber == 0 {
		c.NextNFCeNumber = 1
	}
	if c.NFCeSeries == 0 {
		c.NFCeSeries = 1
	}
	if c.Address.CountryCode == "" {
		c.Address.CountryCode = "1058" // Brasil
	}
	if c.Address.Country == "" {
		c.Address.Country = "Brasil"
	}
	return nil
}

// IsActive checks if company is active
func (c *Company) IsActive() bool {
	return c.Status == CompanyStatusActive
}

// HasCertificate checks if company has a certificate
func (c *Company) HasCertificate() bool {
	return c.CertificateID != nil
}

// IsProduction checks if company is in production environment
func (c *Company) IsProduction() bool {
	return c.Environment == EnvironmentProduction
}

// GetNextNFeNumber returns and increments the next NFe number
func (c *Company) GetNextNFeNumber(tx *gorm.DB) (int, error) {
	currentNumber := c.NextNFeNumber
	c.NextNFeNumber++
	
	if err := tx.Model(c).Update("next_nfe_number", c.NextNFeNumber).Error; err != nil {
		return 0, err
	}
	
	return currentNumber, nil
}

// GetFullAddress returns the full address as a string
func (c *Company) GetFullAddress() string {
	addr := c.Address
	return addr.Street + ", " + addr.Number + " - " + addr.District + ", " + addr.City + " - " + addr.State + ", " + addr.ZipCode
}

