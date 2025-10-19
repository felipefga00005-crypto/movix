package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PaymentMethod represents the payment method
type PaymentMethod string

const (
	PaymentMethodCash         PaymentMethod = "01" // Dinheiro
	PaymentMethodCheck        PaymentMethod = "02" // Cheque
	PaymentMethodCreditCard   PaymentMethod = "03" // Cartão de Crédito
	PaymentMethodDebitCard    PaymentMethod = "04" // Cartão de Débito
	PaymentMethodStoreCredit  PaymentMethod = "05" // Crédito Loja
	PaymentMethodFoodVoucher  PaymentMethod = "10" // Vale Alimentação
	PaymentMethodMealVoucher  PaymentMethod = "11" // Vale Refeição
	PaymentMethodGiftVoucher  PaymentMethod = "12" // Vale Presente
	PaymentMethodFuelVoucher  PaymentMethod = "13" // Vale Combustível
	PaymentMethodBankSlip     PaymentMethod = "15" // Boleto Bancário
	PaymentMethodDeposit      PaymentMethod = "16" // Depósito Bancário
	PaymentMethodPIX          PaymentMethod = "17" // PIX
	PaymentMethodTransfer     PaymentMethod = "18" // Transferência bancária
	PaymentMethodLoyalty      PaymentMethod = "19" // Programa de fidelidade
	PaymentMethodInstantPay   PaymentMethod = "20" // Pagamento instantâneo
	PaymentMethodOthers       PaymentMethod = "99" // Outros
)

// CardFlag represents the card flag
type CardFlag string

const (
	CardFlagVisa       CardFlag = "01" // Visa
	CardFlagMastercard CardFlag = "02" // Mastercard
	CardFlagAmex       CardFlag = "03" // American Express
	CardFlagElo        CardFlag = "04" // Elo
	CardFlagHipercard  CardFlag = "05" // Hipercard
	CardFlagDiners     CardFlag = "06" // Diners Club
	CardFlagOthers     CardFlag = "99" // Outros
)

// NFePayment represents a payment in the NFe
type NFePayment struct {
	ID                    uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	NFeID                 uuid.UUID      `gorm:"type:uuid;not null;index" json:"nfe_id"`
	Method                PaymentMethod  `gorm:"type:varchar(2);not null" json:"method"`                     // Forma de pagamento
	Value                 float64        `gorm:"type:decimal(15,2);not null" json:"value"`                   // Valor
	
	// Card info (when applicable)
	CardCNPJ              string         `gorm:"type:varchar(18)" json:"card_cnpj"`                          // CNPJ da operadora de cartão
	CardFlag              CardFlag       `gorm:"type:varchar(2)" json:"card_flag"`                           // Bandeira do cartão
	CardAuthorizationCode string         `gorm:"type:varchar(20)" json:"card_authorization_code"`            // Código de autorização
	
	// PIX info (when applicable)
	PIXKey                string         `gorm:"type:varchar(255)" json:"pix_key"`                           // Chave PIX
	
	// Installment info (when applicable)
	DueDate               *time.Time     `json:"due_date"`                                                   // Data de vencimento
	InstallmentNumber     int            `gorm:"default:1" json:"installment_number"`                        // Número da parcela
	
	CreatedAt             time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt             time.Time      `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	NFe                   *NFe           `gorm:"foreignKey:NFeID;constraint:OnDelete:CASCADE" json:"nfe,omitempty"`
}

// TableName specifies the table name for NFePayment model
func (NFePayment) TableName() string {
	return "nfe_payments"
}

// BeforeCreate hook to set default values
func (p *NFePayment) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	if p.InstallmentNumber == 0 {
		p.InstallmentNumber = 1
	}
	return nil
}

// IsCreditCard checks if payment is credit card
func (p *NFePayment) IsCreditCard() bool {
	return p.Method == PaymentMethodCreditCard
}

// IsDebitCard checks if payment is debit card
func (p *NFePayment) IsDebitCard() bool {
	return p.Method == PaymentMethodDebitCard
}

// IsCard checks if payment is card (credit or debit)
func (p *NFePayment) IsCard() bool {
	return p.IsCreditCard() || p.IsDebitCard()
}

// IsPIX checks if payment is PIX
func (p *NFePayment) IsPIX() bool {
	return p.Method == PaymentMethodPIX
}

// IsCash checks if payment is cash
func (p *NFePayment) IsCash() bool {
	return p.Method == PaymentMethodCash
}

// GetMethodDescription returns the description of the payment method
func (p *NFePayment) GetMethodDescription() string {
	descriptions := map[PaymentMethod]string{
		PaymentMethodCash:        "Dinheiro",
		PaymentMethodCheck:       "Cheque",
		PaymentMethodCreditCard:  "Cartão de Crédito",
		PaymentMethodDebitCard:   "Cartão de Débito",
		PaymentMethodStoreCredit: "Crédito Loja",
		PaymentMethodFoodVoucher: "Vale Alimentação",
		PaymentMethodMealVoucher: "Vale Refeição",
		PaymentMethodGiftVoucher: "Vale Presente",
		PaymentMethodFuelVoucher: "Vale Combustível",
		PaymentMethodBankSlip:    "Boleto Bancário",
		PaymentMethodDeposit:     "Depósito Bancário",
		PaymentMethodPIX:         "PIX",
		PaymentMethodTransfer:    "Transferência bancária",
		PaymentMethodLoyalty:     "Programa de fidelidade",
		PaymentMethodInstantPay:  "Pagamento instantâneo",
		PaymentMethodOthers:      "Outros",
	}
	return descriptions[p.Method]
}

