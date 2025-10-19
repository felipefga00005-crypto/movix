package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// NFeItem represents an item in the NFe
type NFeItem struct {
	ID                    uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	NFeID                 uuid.UUID      `gorm:"type:uuid;not null;index" json:"nfe_id"`
	ProductID             *uuid.UUID     `gorm:"type:uuid;index" json:"product_id"`                          // Referência ao produto
	Number                int            `gorm:"not null" json:"number"`                                     // Número do item na NFe
	
	// Product Info
	Code                  string         `gorm:"type:varchar(60);not null" json:"code"`                      // Código do produto
	Barcode               string         `gorm:"type:varchar(14)" json:"barcode"`                            // GTIN/EAN
	Description           string         `gorm:"type:varchar(255);not null" json:"description"`              // Descrição
	NCM                   string         `gorm:"type:varchar(8);not null" json:"ncm"`                        // NCM
	CEST                  string         `gorm:"type:varchar(7)" json:"cest"`                                // CEST
	CFOP                  string         `gorm:"type:varchar(4);not null" json:"cfop"`                       // CFOP
	
	// Units and Quantities
	CommercialUnit        string         `gorm:"type:varchar(6);not null" json:"commercial_unit"`            // Unidade comercial
	CommercialQuantity    float64        `gorm:"type:decimal(15,4);not null" json:"commercial_quantity"`     // Quantidade comercial
	CommercialUnitPrice   float64        `gorm:"type:decimal(15,10);not null" json:"commercial_unit_price"`  // Valor unitário comercial
	TaxUnit               string         `gorm:"type:varchar(6)" json:"tax_unit"`                            // Unidade tributável
	TaxQuantity           float64        `gorm:"type:decimal(15,4)" json:"tax_quantity"`                     // Quantidade tributável
	TaxUnitPrice          float64        `gorm:"type:decimal(15,10)" json:"tax_unit_price"`                  // Valor unitário tributável
	
	// Values
	TotalGross            float64        `gorm:"type:decimal(15,2);not null" json:"total_gross"`             // Valor total bruto
	Discount              float64        `gorm:"type:decimal(15,2);default:0" json:"discount"`               // Desconto
	Freight               float64        `gorm:"type:decimal(15,2);default:0" json:"freight"`                // Frete
	Insurance             float64        `gorm:"type:decimal(15,2);default:0" json:"insurance"`              // Seguro
	OtherExpenses         float64        `gorm:"type:decimal(15,2);default:0" json:"other_expenses"`         // Outras despesas
	TotalNet              float64        `gorm:"type:decimal(15,2);not null" json:"total_net"`               // Valor total líquido
	
	// ICMS
	ICMSOrigin            int            `gorm:"type:smallint;not null" json:"icms_origin"`                  // Origem (0-8)
	ICMSCST               string         `gorm:"type:varchar(3)" json:"icms_cst"`                            // CST ICMS (regime normal)
	ICMSCSOSN             string         `gorm:"type:varchar(4)" json:"icms_csosn"`                          // CSOSN (Simples Nacional)
	ICMSModBC             int            `gorm:"type:smallint" json:"icms_mod_bc"`                           // Modalidade BC ICMS
	ICMSBaseCalc          float64        `gorm:"type:decimal(15,2);default:0" json:"icms_base_calc"`         // Base de cálculo ICMS
	ICMSRate              float64        `gorm:"type:decimal(5,2);default:0" json:"icms_rate"`               // Alíquota ICMS
	ICMSValue             float64        `gorm:"type:decimal(15,2);default:0" json:"icms_value"`             // Valor ICMS
	ICMSReducedBasePerc   float64        `gorm:"type:decimal(5,2);default:0" json:"icms_reduced_base_perc"`  // Percentual redução BC
	
	// ICMS ST (Substituição Tributária)
	ICMSSTModBC           int            `gorm:"type:smallint" json:"icms_st_mod_bc"`                        // Modalidade BC ICMS ST
	ICMSSTMVA             float64        `gorm:"type:decimal(5,2);default:0" json:"icms_st_mva"`             // MVA
	ICMSSTBaseCalc        float64        `gorm:"type:decimal(15,2);default:0" json:"icms_st_base_calc"`      // Base de cálculo ICMS ST
	ICMSSTRate            float64        `gorm:"type:decimal(5,2);default:0" json:"icms_st_rate"`            // Alíquota ICMS ST
	ICMSSTValue           float64        `gorm:"type:decimal(15,2);default:0" json:"icms_st_value"`          // Valor ICMS ST
	
	// FCP (Fundo de Combate à Pobreza)
	FCPBaseCalc           float64        `gorm:"type:decimal(15,2);default:0" json:"fcp_base_calc"`          // Base de cálculo FCP
	FCPRate               float64        `gorm:"type:decimal(5,2);default:0" json:"fcp_rate"`                // Alíquota FCP
	FCPValue              float64        `gorm:"type:decimal(15,2);default:0" json:"fcp_value"`              // Valor FCP
	FCPSTBaseCalc         float64        `gorm:"type:decimal(15,2);default:0" json:"fcp_st_base_calc"`       // Base de cálculo FCP ST
	FCPSTRate             float64        `gorm:"type:decimal(5,2);default:0" json:"fcp_st_rate"`             // Alíquota FCP ST
	FCPSTValue            float64        `gorm:"type:decimal(15,2);default:0" json:"fcp_st_value"`           // Valor FCP ST
	
	// IPI
	IPICST                string         `gorm:"type:varchar(3)" json:"ipi_cst"`                             // CST IPI
	IPIBaseCalc           float64        `gorm:"type:decimal(15,2);default:0" json:"ipi_base_calc"`          // Base de cálculo IPI
	IPIRate               float64        `gorm:"type:decimal(5,2);default:0" json:"ipi_rate"`                // Alíquota IPI
	IPIValue              float64        `gorm:"type:decimal(15,2);default:0" json:"ipi_value"`              // Valor IPI
	
	// PIS
	PISCST                string         `gorm:"type:varchar(2)" json:"pis_cst"`                             // CST PIS
	PISBaseCalc           float64        `gorm:"type:decimal(15,2);default:0" json:"pis_base_calc"`          // Base de cálculo PIS
	PISRate               float64        `gorm:"type:decimal(5,4);default:0" json:"pis_rate"`                // Alíquota PIS
	PISValue              float64        `gorm:"type:decimal(15,2);default:0" json:"pis_value"`              // Valor PIS
	
	// COFINS
	COFINSCST             string         `gorm:"type:varchar(2)" json:"cofins_cst"`                          // CST COFINS
	COFINSBaseCalc        float64        `gorm:"type:decimal(15,2);default:0" json:"cofins_base_calc"`       // Base de cálculo COFINS
	COFINSRate            float64        `gorm:"type:decimal(5,4);default:0" json:"cofins_rate"`             // Alíquota COFINS
	COFINSValue           float64        `gorm:"type:decimal(15,2);default:0" json:"cofins_value"`           // Valor COFINS
	
	// Additional
	AdditionalInfo        string         `gorm:"type:text" json:"additional_info"`                           // Informações adicionais
	
	CreatedAt             time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt             time.Time      `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	NFe                   *NFe           `gorm:"foreignKey:NFeID;constraint:OnDelete:CASCADE" json:"nfe,omitempty"`
	Product               *Product       `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// TableName specifies the table name for NFeItem model
func (NFeItem) TableName() string {
	return "nfe_items"
}

// BeforeCreate hook to set default values
func (item *NFeItem) BeforeCreate(tx *gorm.DB) error {
	if item.ID == uuid.Nil {
		item.ID = uuid.New()
	}
	if item.TaxUnit == "" {
		item.TaxUnit = item.CommercialUnit
	}
	if item.TaxQuantity == 0 {
		item.TaxQuantity = item.CommercialQuantity
	}
	if item.TaxUnitPrice == 0 {
		item.TaxUnitPrice = item.CommercialUnitPrice
	}
	return nil
}

// CalculateTotalGross calculates the gross total
func (item *NFeItem) CalculateTotalGross() {
	item.TotalGross = item.CommercialQuantity * item.CommercialUnitPrice
}

// CalculateTotalNet calculates the net total
func (item *NFeItem) CalculateTotalNet() {
	item.TotalNet = item.TotalGross - item.Discount + item.Freight + item.Insurance + item.OtherExpenses
}

// CalculateTotals calculates all totals
func (item *NFeItem) CalculateTotals() {
	item.CalculateTotalGross()
	item.CalculateTotalNet()
}

