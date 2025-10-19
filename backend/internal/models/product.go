package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ProductOrigin represents the origin of the product
type ProductOrigin int

const (
	OriginNational                ProductOrigin = 0 // Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
	OriginForeignDirectImport     ProductOrigin = 1 // Estrangeira - Importação direta, exceto a indicada no código 6
	OriginForeignAcquiredDomestic ProductOrigin = 2 // Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7
	OriginNationalOver40          ProductOrigin = 3 // Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%
	OriginNationalBasicProduction ProductOrigin = 4 // Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos
	OriginNationalUnder40         ProductOrigin = 5 // Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%
	OriginForeignDirectNoSimilar  ProductOrigin = 6 // Estrangeira - Importação direta, sem similar nacional, constante em lista CAMEX
	OriginForeignAcquiredNoSimilar ProductOrigin = 7 // Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista CAMEX
	OriginNationalOver70          ProductOrigin = 8 // Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%
)

// Product represents a product/item
type Product struct {
	ID                uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CompanyID         uuid.UUID      `gorm:"type:uuid;not null;index" json:"company_id"`
	Code              string         `gorm:"type:varchar(60);not null;index" json:"code"`                    // Código interno do produto
	Description       string         `gorm:"type:varchar(255);not null" json:"description"`                  // Descrição do produto
	Barcode           string         `gorm:"type:varchar(14)" json:"barcode"`                                // GTIN/EAN
	BarcodeUnit       string         `gorm:"type:varchar(14)" json:"barcode_unit"`                           // GTIN da unidade tributável
	NCM               string         `gorm:"type:varchar(8);not null;index" json:"ncm"`                      // Código NCM (8 dígitos)
	CEST              string         `gorm:"type:varchar(7)" json:"cest"`                                    // Código CEST (7 dígitos)
	CFOP              string         `gorm:"type:varchar(4)" json:"cfop"`                                    // CFOP padrão
	CommercialUnit    string         `gorm:"type:varchar(6);not null" json:"commercial_unit"`                // Unidade comercial (UN, KG, etc)
	TaxUnit           string         `gorm:"type:varchar(6)" json:"tax_unit"`                                // Unidade tributável
	CostPrice         float64        `gorm:"type:decimal(15,2);default:0" json:"cost_price"`                 // Preço de custo
	SalePrice         float64        `gorm:"type:decimal(15,2);default:0" json:"sale_price"`                 // Preço de venda
	Origin            ProductOrigin  `gorm:"type:smallint;not null;default:0" json:"origin"`                 // Origem da mercadoria (0-8)
	
	// Stock
	CurrentStock      float64        `gorm:"type:decimal(15,3);default:0" json:"current_stock"`              // Estoque atual
	MinStock          float64        `gorm:"type:decimal(15,3);default:0" json:"min_stock"`                  // Estoque mínimo
	MaxStock          float64        `gorm:"type:decimal(15,3);default:0" json:"max_stock"`                  // Estoque máximo
	
	// Tax
	DefaultTaxRuleID  *uuid.UUID     `gorm:"type:uuid;index" json:"default_tax_rule_id"`                     // Regra tributária padrão
	
	// Additional
	AdditionalInfo    string         `gorm:"type:text" json:"additional_info"`                               // Informações adicionais
	Active            bool           `gorm:"default:true;index" json:"active"`
	
	CreatedAt         time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Company           *Company       `gorm:"foreignKey:CompanyID;constraint:OnDelete:CASCADE" json:"company,omitempty"`
}

// TableName specifies the table name for Product model
func (Product) TableName() string {
	return "products"
}

// BeforeCreate hook to set default values
func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	if p.CommercialUnit == "" {
		p.CommercialUnit = "UN"
	}
	if p.TaxUnit == "" {
		p.TaxUnit = p.CommercialUnit
	}
	return nil
}

// IsActive checks if product is active
func (p *Product) IsActive() bool {
	return p.Active
}

// HasStock checks if product has stock available
func (p *Product) HasStock(quantity float64) bool {
	return p.CurrentStock >= quantity
}

// NeedsRestock checks if product needs restocking
func (p *Product) NeedsRestock() bool {
	return p.CurrentStock <= p.MinStock
}

// UpdateStock updates the current stock
func (p *Product) UpdateStock(tx *gorm.DB, quantity float64) error {
	p.CurrentStock += quantity
	return tx.Model(p).Update("current_stock", p.CurrentStock).Error
}

// GetOriginDescription returns the description of the origin
func (p *Product) GetOriginDescription() string {
	descriptions := map[ProductOrigin]string{
		OriginNational:                "Nacional",
		OriginForeignDirectImport:     "Estrangeira - Importação direta",
		OriginForeignAcquiredDomestic: "Estrangeira - Adquirida no mercado interno",
		OriginNationalOver40:          "Nacional - Conteúdo de Importação > 40% e <= 70%",
		OriginNationalBasicProduction: "Nacional - Processos produtivos básicos",
		OriginNationalUnder40:         "Nacional - Conteúdo de Importação <= 40%",
		OriginForeignDirectNoSimilar:  "Estrangeira - Importação direta sem similar",
		OriginForeignAcquiredNoSimilar: "Estrangeira - Mercado interno sem similar",
		OriginNationalOver70:          "Nacional - Conteúdo de Importação > 70%",
	}
	return descriptions[p.Origin]
}

