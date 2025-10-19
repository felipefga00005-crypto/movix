package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Carrier represents a carrier/transporter (transportadora)
type Carrier struct {
	ID                uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CompanyID         uuid.UUID      `gorm:"type:uuid;not null;index" json:"company_id"`
	Name              string         `gorm:"type:varchar(255);not null" json:"name"`                     // Razão Social
	TradeName         string         `gorm:"type:varchar(255)" json:"trade_name"`                        // Nome Fantasia
	Document          string         `gorm:"type:varchar(18);not null;index" json:"document"`            // CPF ou CNPJ
	StateRegistration string         `gorm:"type:varchar(20)" json:"state_registration"`                 // Inscrição Estadual
	
	// Address
	Street            string         `gorm:"type:varchar(255)" json:"street"`
	Number            string         `gorm:"type:varchar(20)" json:"number"`
	Complement        string         `gorm:"type:varchar(100)" json:"complement"`
	District          string         `gorm:"type:varchar(100)" json:"district"`
	City              string         `gorm:"type:varchar(100)" json:"city"`
	State             string         `gorm:"type:varchar(2)" json:"state"`                               // UF
	ZipCode           string         `gorm:"type:varchar(10)" json:"zip_code"`
	
	// Vehicle
	VehiclePlate      string         `gorm:"type:varchar(10)" json:"vehicle_plate"`                      // Placa do veículo
	VehicleState      string         `gorm:"type:varchar(2)" json:"vehicle_state"`                       // UF da placa
	RNTRC             string         `gorm:"type:varchar(20)" json:"rntrc"`                              // Registro Nacional de Transportadores Rodoviários de Carga
	
	Active            bool           `gorm:"default:true;index" json:"active"`
	
	CreatedAt         time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Company           *Company       `gorm:"foreignKey:CompanyID;constraint:OnDelete:CASCADE" json:"company,omitempty"`
}

// TableName specifies the table name for Carrier model
func (Carrier) TableName() string {
	return "carriers"
}

// BeforeCreate hook to set default values
func (c *Carrier) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// IsActive checks if carrier is active
func (c *Carrier) IsActive() bool {
	return c.Active
}

// GetFullAddress returns the full address as a string
func (c *Carrier) GetFullAddress() string {
	if c.Street == "" {
		return ""
	}
	return c.Street + ", " + c.Number + " - " + c.District + ", " + c.City + " - " + c.State + ", " + c.ZipCode
}

