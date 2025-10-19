package models

import (
	"time"

	"gorm.io/gorm"
)

// CFOPType represents the type of CFOP operation
type CFOPType string

const (
	CFOPTypeEntrada CFOPType = "entrada" // Entrada (compra)
	CFOPTypeSaida   CFOPType = "saida"   // Saída (venda)
)

// CFOP represents a Código Fiscal de Operações e Prestações
type CFOP struct {
	Code        string         `gorm:"type:varchar(4);primary_key" json:"code"`
	Description string         `gorm:"type:varchar(255);not null" json:"description"`
	Type        CFOPType       `gorm:"type:varchar(10);not null" json:"type"`
	Application string         `gorm:"type:text" json:"application"` // Aplicação/quando usar
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for CFOP model
func (CFOP) TableName() string {
	return "cfops"
}

// IsEntrada checks if CFOP is for entrada (purchase)
func (c *CFOP) IsEntrada() bool {
	return c.Type == CFOPTypeEntrada
}

// IsSaida checks if CFOP is for saida (sale)
func (c *CFOP) IsSaida() bool {
	return c.Type == CFOPTypeSaida
}

