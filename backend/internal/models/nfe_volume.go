package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// NFeVolume represents a volume/package in the NFe transport
type NFeVolume struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	NFeID       uuid.UUID `gorm:"type:uuid;not null;index" json:"nfe_id"`
	Quantity    int       `gorm:"default:1" json:"quantity"`                                  // Quantidade de volumes
	Species     string    `gorm:"type:varchar(60)" json:"species"`                            // Espécie (Caixa, Fardo, etc)
	Brand       string    `gorm:"type:varchar(60)" json:"brand"`                              // Marca
	Numbering   string    `gorm:"type:varchar(60)" json:"numbering"`                          // Numeração
	GrossWeight float64   `gorm:"type:decimal(15,3);default:0" json:"gross_weight"`           // Peso bruto (kg)
	NetWeight   float64   `gorm:"type:decimal(15,3);default:0" json:"net_weight"`             // Peso líquido (kg)
	
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	NFe         *NFe      `gorm:"foreignKey:NFeID;constraint:OnDelete:CASCADE" json:"nfe,omitempty"`
}

// TableName specifies the table name for NFeVolume model
func (NFeVolume) TableName() string {
	return "nfe_volumes"
}

// BeforeCreate hook to set default values
func (v *NFeVolume) BeforeCreate(tx *gorm.DB) error {
	if v.ID == uuid.Nil {
		v.ID = uuid.New()
	}
	if v.Quantity == 0 {
		v.Quantity = 1
	}
	return nil
}

