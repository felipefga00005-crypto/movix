package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CustomerType represents the type of customer
type CustomerType string

const (
	CustomerTypeNormal     CustomerType = "normal"
	CustomerTypeForeign    CustomerType = "foreign"
	CustomerTypeConsumer   CustomerType = "consumer" // Consumidor final
)

// PersonType represents the person type
type PersonType string

const (
	PersonTypeIndividual PersonType = "individual" // Pessoa Física (CPF)
	PersonTypeLegal      PersonType = "legal"      // Pessoa Jurídica (CNPJ)
)

// StateRegistrationType represents the type of state registration
type StateRegistrationType string

const (
	StateRegistrationTypeContributor    StateRegistrationType = "contributor"     // Contribuinte ICMS
	StateRegistrationTypeExempt         StateRegistrationType = "exempt"          // Isento
	StateRegistrationTypeNonContributor StateRegistrationType = "non_contributor" // Não Contribuinte
)

// Customer represents a customer/client (destinatário da NFe)
type Customer struct {
	ID                     uuid.UUID              `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CompanyID              uuid.UUID              `gorm:"type:uuid;not null;index" json:"company_id"`
	Type                   CustomerType           `gorm:"type:varchar(20);not null;default:'normal'" json:"type"`
	PersonType             PersonType             `gorm:"type:varchar(20);not null" json:"person_type"`
	Name                   string                 `gorm:"type:varchar(255);not null" json:"name"`                     // Nome/Razão Social
	TradeName              string                 `gorm:"type:varchar(255)" json:"trade_name"`                        // Nome Fantasia
	Document               string                 `gorm:"type:varchar(18);not null;index" json:"document"`            // CPF ou CNPJ
	StateRegistration      string                 `gorm:"type:varchar(20)" json:"state_registration"`                 // Inscrição Estadual
	StateRegistrationType  StateRegistrationType  `gorm:"type:varchar(20)" json:"state_registration_type"`            // Tipo de IE
	MunicipalRegistration  string                 `gorm:"type:varchar(20)" json:"municipal_registration"`             // Inscrição Municipal
	SUFRAMA                string                 `gorm:"type:varchar(20)" json:"suframa"`                            // Inscrição SUFRAMA
	
	// Address fields
	Street                 string                 `gorm:"type:varchar(255)" json:"street"`
	Number                 string                 `gorm:"type:varchar(20)" json:"number"`
	Complement             string                 `gorm:"type:varchar(100)" json:"complement"`
	District               string                 `gorm:"type:varchar(100)" json:"district"`
	City                   string                 `gorm:"type:varchar(100)" json:"city"`
	State                  string                 `gorm:"type:varchar(2)" json:"state"`                               // UF
	ZipCode                string                 `gorm:"type:varchar(10)" json:"zip_code"`
	CityCode               string                 `gorm:"type:varchar(10)" json:"city_code"`                          // Código IBGE
	CountryCode            string                 `gorm:"type:varchar(10);default:'1058'" json:"country_code"`        // Código do país
	Country                string                 `gorm:"type:varchar(100);default:'Brasil'" json:"country"`
	
	// Contact
	Email                  string                 `gorm:"type:varchar(255)" json:"email"`
	Phone                  string                 `gorm:"type:varchar(20)" json:"phone"`
	Mobile                 string                 `gorm:"type:varchar(20)" json:"mobile"`
	
	// Tax info
	TaxRegime              TaxRegime              `gorm:"type:varchar(30)" json:"tax_regime"`                         // Regime tributário
	ICMSContributor        bool                   `gorm:"default:false" json:"icms_contributor"`                      // Contribuinte de ICMS
	
	// Additional
	Notes                  string                 `gorm:"type:text" json:"notes"`
	Active                 bool                   `gorm:"default:true;index" json:"active"`
	
	CreatedAt              time.Time              `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt              time.Time              `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt              gorm.DeletedAt         `gorm:"index" json:"-"`

	// Relationships
	Company                *Company               `gorm:"foreignKey:CompanyID;constraint:OnDelete:CASCADE" json:"company,omitempty"`
}

// TableName specifies the table name for Customer model
func (Customer) TableName() string {
	return "customers"
}

// BeforeCreate hook to set default values
func (c *Customer) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	if c.Type == "" {
		c.Type = CustomerTypeNormal
	}
	if c.CountryCode == "" {
		c.CountryCode = "1058" // Brasil
	}
	if c.Country == "" {
		c.Country = "Brasil"
	}
	return nil
}

// IsActive checks if customer is active
func (c *Customer) IsActive() bool {
	return c.Active
}

// IsCPF checks if document is CPF
func (c *Customer) IsCPF() bool {
	return c.PersonType == PersonTypeIndividual
}

// IsCNPJ checks if document is CNPJ
func (c *Customer) IsCNPJ() bool {
	return c.PersonType == PersonTypeLegal
}

// IsICMSContributor checks if customer is ICMS contributor
func (c *Customer) IsICMSContributor() bool {
	return c.ICMSContributor && c.StateRegistrationType == StateRegistrationTypeContributor
}

// GetFullAddress returns the full address as a string
func (c *Customer) GetFullAddress() string {
	return c.Street + ", " + c.Number + " - " + c.District + ", " + c.City + " - " + c.State + ", " + c.ZipCode
}

