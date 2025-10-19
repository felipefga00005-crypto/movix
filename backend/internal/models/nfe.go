package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// NFeStatus represents the status of an NFe
type NFeStatus string

const (
	NFeStatusDraft      NFeStatus = "draft"
	NFeStatusPending    NFeStatus = "pending"
	NFeStatusAuthorized NFeStatus = "authorized"
	NFeStatusRejected   NFeStatus = "rejected"
	NFeStatusCancelled  NFeStatus = "cancelled"
)

// NFeType represents the type of NFe
type NFeType string

const (
	NFeTypeNormal NFeType = "normal" // NFe normal (modelo 55)
	NFeTypeNFCe   NFeType = "nfce"   // NFC-e (modelo 65)
)

// NFePurpose represents the purpose of NFe
type NFePurpose int

const (
	NFePurposeNormal       NFePurpose = 1 // Normal
	NFePurposeComplementar NFePurpose = 2 // Complementar
	NFePurposeAdjustment   NFePurpose = 3 // Ajuste
	NFePurposeReturn       NFePurpose = 4 // Devolução/Retorno
)

// ConsumerOperation represents if it's a consumer operation
type ConsumerOperation int

const (
	ConsumerOperationNo  ConsumerOperation = 0 // Não
	ConsumerOperationYes ConsumerOperation = 1 // Sim
)

// PresenceIndicator represents the buyer's presence indicator
type PresenceIndicator int

const (
	PresenceIndicatorNotApplicable PresenceIndicator = 0 // Não se aplica
	PresenceIndicatorInPerson      PresenceIndicator = 1 // Operação presencial
	PresenceIndicatorInternet      PresenceIndicator = 2 // Internet
	PresenceIndicatorTelephone     PresenceIndicator = 3 // Teleatendimento
	PresenceIndicatorNFCeDelivery  PresenceIndicator = 4 // NFC-e em operação com entrega a domicílio
	PresenceIndicatorOthers        PresenceIndicator = 9 // Outros
)

// FreightMode represents the freight mode
type FreightMode int

const (
	FreightModeEmitter    FreightMode = 0 // Por conta do emitente
	FreightModeRecipient  FreightMode = 1 // Por conta do destinatário
	FreightModeThirdParty FreightMode = 2 // Por conta de terceiros
	FreightModeOwn        FreightMode = 3 // Transporte próprio por conta do remetente
	FreightModeOwnDest    FreightMode = 4 // Transporte próprio por conta do destinatário
	FreightModeNone       FreightMode = 9 // Sem frete
)

// PaymentIndicator represents the payment indicator
type PaymentIndicator int

const (
	PaymentIndicatorCash        PaymentIndicator = 0 // À vista
	PaymentIndicatorTerm        PaymentIndicator = 1 // A prazo
	PaymentIndicatorOthers      PaymentIndicator = 2 // Outros
	PaymentIndicatorNone        PaymentIndicator = 3 // Sem pagamento (gratuidade/bonificação)
	PaymentIndicatorCreditCard  PaymentIndicator = 4 // Cartão de crédito
	PaymentIndicatorDebitCard   PaymentIndicator = 5 // Cartão de débito
)

// ReferencedNFes is a slice of referenced NFe keys
type ReferencedNFes []string

// Scan implements the sql.Scanner interface for ReferencedNFes
func (refs *ReferencedNFes) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, refs)
}

// Value implements the driver.Valuer interface for ReferencedNFes
func (refs ReferencedNFes) Value() (driver.Value, error) {
	return json.Marshal(refs)
}

// NFe represents a Nota Fiscal Eletrônica
type NFe struct {
	ID                    uuid.UUID          `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CompanyID             uuid.UUID          `gorm:"type:uuid;not null;index" json:"company_id"`
	UserID                uuid.UUID          `gorm:"type:uuid;not null;index" json:"user_id"`
	CustomerID            *uuid.UUID         `gorm:"type:uuid;index" json:"customer_id"`                         // Referência ao cliente
	Number                int                `gorm:"not null;index" json:"number"`
	Series                int                `gorm:"not null;default:1" json:"series"`
	Model                 string             `gorm:"type:varchar(10);not null;default:'55'" json:"model"`        // 55 = NFe, 65 = NFC-e
	Type                  NFeType            `gorm:"type:varchar(20);not null;default:'normal'" json:"type"`
	Purpose               NFePurpose         `gorm:"type:smallint;not null;default:1" json:"purpose"`            // Finalidade
	ConsumerOperation     ConsumerOperation  `gorm:"type:smallint;not null;default:0" json:"consumer_operation"` // Operação com consumidor final
	PresenceIndicator     PresenceIndicator  `gorm:"type:smallint;not null;default:0" json:"presence_indicator"` // Indicador de presença
	OperationNature       string             `gorm:"type:varchar(60);not null" json:"operation_nature"`          // Natureza da operação
	EntryExitDate         *time.Time         `json:"entry_exit_date"`                                            // Data de entrada/saída

	// Transport
	FreightMode           FreightMode        `gorm:"type:smallint;default:9" json:"freight_mode"`                // Modalidade do frete
	CarrierID             *uuid.UUID         `gorm:"type:uuid;index" json:"carrier_id"`                          // Transportadora
	VehiclePlate          string             `gorm:"type:varchar(10)" json:"vehicle_plate"`                      // Placa do veículo
	VehicleState          string             `gorm:"type:varchar(2)" json:"vehicle_state"`                       // UF da placa
	VehicleRNTRC          string             `gorm:"type:varchar(20)" json:"vehicle_rntrc"`                      // RNTRC

	// Payment
	PaymentIndicator      PaymentIndicator   `gorm:"type:smallint;default:0" json:"payment_indicator"`           // Indicador de pagamento

	// Totals
	TotalProducts         float64            `gorm:"column:total_products;type:decimal(15,2);default:0" json:"total_products"`
	TotalDiscount         float64            `gorm:"column:total_discount;type:decimal(15,2);default:0" json:"total_discount"`
	TotalFreight          float64            `gorm:"column:total_freight;type:decimal(15,2);default:0" json:"total_freight"`
	TotalInsurance        float64            `gorm:"column:total_insurance;type:decimal(15,2);default:0" json:"total_insurance"`
	TotalOtherExpenses    float64            `gorm:"column:total_other_expenses;type:decimal(15,2);default:0" json:"total_other_expenses"`
	TotalICMS             float64            `gorm:"column:total_icms;type:decimal(15,2);default:0" json:"total_icms"`
	TotalICMSST           float64            `gorm:"column:total_icms_st;type:decimal(15,2);default:0" json:"total_icms_st"`
	TotalIPI              float64            `gorm:"column:total_ipi;type:decimal(15,2);default:0" json:"total_ipi"`
	TotalPIS              float64            `gorm:"column:total_pis;type:decimal(15,2);default:0" json:"total_pis"`
	TotalCOFINS           float64            `gorm:"column:total_cofins;type:decimal(15,2);default:0" json:"total_cofins"`
	TotalFCP              float64            `gorm:"column:total_fcp;type:decimal(15,2);default:0" json:"total_fcp"`
	TotalNFe              float64            `gorm:"column:total_nfe;type:decimal(15,2);default:0" json:"total_nfe"`

	// Additional Info
	AdditionalInfo        string             `gorm:"type:text" json:"additional_info"`                           // Informações adicionais
	FiscalInfo            string             `gorm:"type:text" json:"fiscal_info"`                               // Informações fiscais
	ReferencedNFes        ReferencedNFes     `gorm:"type:jsonb" json:"referenced_nfes"`                          // NFes referenciadas

	// Status and Control
	Status                NFeStatus          `gorm:"type:varchar(20);not null;default:'draft'" json:"status"`
	AccessKey             string             `gorm:"type:varchar(44);index" json:"access_key"`                   // Chave de Acesso (44 dígitos)
	Protocol              string             `gorm:"type:varchar(50)" json:"protocol"`                           // Protocolo de autorização
	XML                   string             `gorm:"type:text" json:"xml,omitempty"`                             // XML completo da NFe
	StatusCode            string             `gorm:"type:varchar(10)" json:"status_code"`                        // Código de status SEFAZ
	RejectionReason       string             `gorm:"type:text" json:"rejection_reason"`                          // Motivo de rejeição SEFAZ
	CancellationReason    string             `gorm:"type:varchar(255)" json:"cancellation_reason"`               // Motivo do cancelamento
	CancellationProtocol  string             `gorm:"type:varchar(50)" json:"cancellation_protocol"`              // Protocolo de cancelamento

	// Dates
	IssuedAt              *time.Time         `gorm:"index" json:"issued_at"`                                     // Data de emissão
	AuthorizedAt          *time.Time         `json:"authorized_at"`                                              // Data de autorização
	CancelledAt           *time.Time         `json:"cancelled_at"`                                               // Data de cancelamento
	CreatedAt             time.Time          `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt             time.Time          `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt             gorm.DeletedAt     `gorm:"index" json:"-"`

	// Relationships
	Company               *Company           `gorm:"foreignKey:CompanyID;constraint:OnDelete:CASCADE" json:"company,omitempty"`
	User                  *User              `gorm:"foreignKey:UserID;constraint:OnDelete:SET NULL" json:"user,omitempty"`
	Customer              *Customer          `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	Carrier               *Carrier           `gorm:"foreignKey:CarrierID" json:"carrier,omitempty"`
	Items                 []NFeItem          `gorm:"foreignKey:NFeID" json:"items,omitempty"`
	Payments              []NFePayment       `gorm:"foreignKey:NFeID" json:"payments,omitempty"`
	Volumes               []NFeVolume        `gorm:"foreignKey:NFeID" json:"volumes,omitempty"`
}

// TableName specifies the table name for NFe model
func (NFe) TableName() string {
	return "nfes"
}

// BeforeCreate hook to set default values
func (n *NFe) BeforeCreate(tx *gorm.DB) error {
	if n.ID == uuid.Nil {
		n.ID = uuid.New()
	}
	if n.Status == "" {
		n.Status = NFeStatusDraft
	}
	if n.Model == "" {
		n.Model = "55"
	}
	if n.Series == 0 {
		n.Series = 1
	}
	return nil
}

// IsDraft checks if NFe is in draft status
func (n *NFe) IsDraft() bool {
	return n.Status == NFeStatusDraft
}

// IsPending checks if NFe is pending authorization
func (n *NFe) IsPending() bool {
	return n.Status == NFeStatusPending
}

// IsAuthorized checks if NFe is authorized
func (n *NFe) IsAuthorized() bool {
	return n.Status == NFeStatusAuthorized
}

// IsRejected checks if NFe was rejected
func (n *NFe) IsRejected() bool {
	return n.Status == NFeStatusRejected
}

// IsCancelled checks if NFe was cancelled
func (n *NFe) IsCancelled() bool {
	return n.Status == NFeStatusCancelled
}

// CanBeCancelled checks if NFe can be cancelled (within 24 hours)
func (n *NFe) CanBeCancelled() bool {
	if !n.IsAuthorized() || n.AuthorizedAt == nil {
		return false
	}
	
	// NFe can be cancelled within 24 hours of authorization
	deadline := n.AuthorizedAt.Add(24 * time.Hour)
	return time.Now().Before(deadline)
}

// CalculateTotalNFe calculates the final total of NFe
func (n *NFe) CalculateTotalNFe() {
	n.TotalNFe = n.TotalProducts + n.TotalFreight + n.TotalInsurance + n.TotalOtherExpenses + n.TotalICMSST + n.TotalIPI - n.TotalDiscount
}

