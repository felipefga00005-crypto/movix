package models

import (
	"time"
	"gorm.io/gorm"
)

// Venda representa uma venda/transação no PDV
type Venda struct {
	ID              uint        `gorm:"primaryKey;column:id" json:"id"`
	NumeroVenda     string      `gorm:"uniqueIndex;not null;column:numero_venda" json:"numero_venda"`
	ClienteID       *uint       `gorm:"index;column:cliente_id" json:"cliente_id"`
	UsuarioID       uint        `gorm:"not null;index;column:usuario_id" json:"usuario_id"`
	NaturezaOpID    uint        `gorm:"not null;index;column:natureza_op_id" json:"natureza_op_id"`
	TotalProdutos   float64     `gorm:"type:decimal(15,2);not null;column:total_produtos" json:"total_produtos"`
	TotalDesconto   float64     `gorm:"type:decimal(15,2);default:0;column:total_desconto" json:"total_desconto"`
	TotalVenda      float64     `gorm:"type:decimal(15,2);not null;column:total_venda" json:"total_venda"`
	Status          string      `gorm:"size:20;default:'pendente';column:status" json:"status"` // pendente, finalizada, cancelada
	
	// Dados Fiscais
	NFCeNumero      *string     `gorm:"index;column:nfce_numero" json:"nfce_numero"`
	NFCeChave       *string     `gorm:"index;column:nfce_chave" json:"nfce_chave"`
	NFCeXML         *string     `gorm:"type:text;column:nfce_xml" json:"nfce_xml"`
	NFCeStatus      string      `gorm:"size:20;default:'nao_emitida';column:nfce_status" json:"nfce_status"` // nao_emitida, autorizada, rejeitada, cancelada
	NFCeProtocolo   *string     `gorm:"column:nfce_protocolo" json:"nfce_protocolo"`
	NFCeDataAut     *time.Time  `gorm:"column:nfce_data_aut" json:"nfce_data_aut"`
	
	// Forma de Pagamento
	FormaPagamento  int         `gorm:"default:1;column:forma_pagamento" json:"forma_pagamento"` // 01=Dinheiro, 02=Cheque, 03=Cartão, etc.
	ValorPago       float64     `gorm:"type:decimal(15,2);column:valor_pago" json:"valor_pago"`
	ValorTroco      float64     `gorm:"type:decimal(15,2);default:0;column:valor_troco" json:"valor_troco"`
	
	// Observações
	Observacoes     string      `gorm:"type:text;column:observacoes" json:"observacoes"`
	
	// Controle
	CreatedAt       time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
	
	// Relacionamentos
	Cliente         *Cliente         `gorm:"foreignKey:ClienteID" json:"cliente,omitempty"`
	Usuario         User             `gorm:"foreignKey:UsuarioID" json:"usuario,omitempty"`
	NaturezaOp      NaturezaOperacao `gorm:"foreignKey:NaturezaOpID" json:"natureza_operacao,omitempty"`
	Itens           []ItemVenda      `gorm:"foreignKey:VendaID" json:"itens,omitempty"`
}

func (Venda) TableName() string {
	return "vendas"
}

// ItemVenda representa um item de uma venda
type ItemVenda struct {
	ID          uint    `gorm:"primaryKey;column:id" json:"id"`
	VendaID     uint    `gorm:"not null;index;column:venda_id" json:"venda_id"`
	ProdutoID   uint    `gorm:"not null;index;column:produto_id" json:"produto_id"`
	Quantidade  float64 `gorm:"type:decimal(10,3);not null;column:quantidade" json:"quantidade"`
	ValorUnit   float64 `gorm:"type:decimal(15,2);not null;column:valor_unit" json:"valor_unit"`
	ValorDesc   float64 `gorm:"type:decimal(15,2);default:0;column:valor_desc" json:"valor_desc"`
	ValorTotal  float64 `gorm:"type:decimal(15,2);not null;column:valor_total" json:"valor_total"`
	
	// Relacionamentos
	Venda       Venda   `gorm:"foreignKey:VendaID" json:"venda,omitempty"`
	Produto     Produto `gorm:"foreignKey:ProdutoID" json:"produto,omitempty"`
}

func (ItemVenda) TableName() string {
	return "itens_venda"
}

// ============================================
// MÉTODOS DE NEGÓCIO
// ============================================

// IsPendente verifica se a venda está pendente
func (v *Venda) IsPendente() bool {
	return v.Status == "pendente"
}

// IsFinalizada verifica se a venda está finalizada
func (v *Venda) IsFinalizada() bool {
	return v.Status == "finalizada"
}

// IsCancelada verifica se a venda está cancelada
func (v *Venda) IsCancelada() bool {
	return v.Status == "cancelada"
}

// IsNFCeEmitida verifica se a NFCe foi emitida
func (v *Venda) IsNFCeEmitida() bool {
	return v.NFCeStatus == "autorizada"
}

// CanEmitirNFCe verifica se pode emitir NFCe
func (v *Venda) CanEmitirNFCe() bool {
	return v.IsFinalizada() && v.NFCeStatus == "nao_emitida"
}

// CanCancelarNFCe verifica se pode cancelar NFCe
func (v *Venda) CanCancelarNFCe() bool {
	return v.IsNFCeEmitida() && v.NFCeChave != nil
}

// GetDescricaoFormaPagamento retorna a descrição da forma de pagamento
func (v *Venda) GetDescricaoFormaPagamento() string {
	formas := map[int]string{
		1:  "Dinheiro",
		2:  "Cheque",
		3:  "Cartão de Crédito",
		4:  "Cartão de Débito",
		5:  "Crédito Loja",
		10: "Vale Alimentação",
		11: "Vale Refeição",
		12: "Vale Presente",
		13: "Vale Combustível",
		15: "Boleto Bancário",
		16: "Depósito Bancário",
		17: "Pagamento Instantâneo (PIX)",
		18: "Transferência bancária, Carteira Digital",
		19: "Programa de fidelidade, Cashback, Crédito Virtual",
		90: "Sem pagamento",
		99: "Outros",
	}
	if desc, exists := formas[v.FormaPagamento]; exists {
		return desc
	}
	return "Não informado"
}

// CalcularTotais recalcula os totais da venda baseado nos itens
func (v *Venda) CalcularTotais() {
	v.TotalProdutos = 0
	v.TotalDesconto = 0
	
	for _, item := range v.Itens {
		v.TotalProdutos += item.ValorTotal
		v.TotalDesconto += item.ValorDesc
	}
	
	v.TotalVenda = v.TotalProdutos - v.TotalDesconto
}

// ============================================
// DTOs PARA API
// ============================================

type CreateVendaRequest struct {
	ClienteID      *uint                   `json:"cliente_id"`
	NaturezaOpID   uint                    `json:"natureza_op_id" binding:"required"`
	FormaPagamento int                     `json:"forma_pagamento" binding:"required,min=1"`
	ValorPago      float64                 `json:"valor_pago" binding:"required,min=0"`
	Observacoes    string                  `json:"observacoes"`
	Itens          []CreateItemVendaRequest `json:"itens" binding:"required,min=1"`
}

type CreateItemVendaRequest struct {
	ProdutoID  uint    `json:"produto_id" binding:"required"`
	Quantidade float64 `json:"quantidade" binding:"required,min=0.001"`
	ValorUnit  float64 `json:"valor_unit" binding:"required,min=0"`
	ValorDesc  float64 `json:"valor_desc" binding:"min=0"`
}

type UpdateVendaRequest struct {
	ClienteID      *uint   `json:"cliente_id"`
	FormaPagamento *int    `json:"forma_pagamento" binding:"omitempty,min=1"`
	ValorPago      *float64 `json:"valor_pago" binding:"omitempty,min=0"`
	Observacoes    *string `json:"observacoes"`
}

type FinalizarVendaRequest struct {
	FormaPagamento int     `json:"forma_pagamento" binding:"required,min=1"`
	ValorPago      float64 `json:"valor_pago" binding:"required,min=0"`
}

type EmitirNFCeRequest struct {
	VendaID             uint   `json:"venda_id" binding:"required"`
	InformacoesAdic     string `json:"informacoes_adicionais"`
	EmailDestinatario   string `json:"email_destinatario"`
}

type CancelarNFCeRequest struct {
	VendaID       uint   `json:"venda_id" binding:"required"`
	Justificativa string `json:"justificativa" binding:"required,min=15,max=255"`
}

// ============================================
// RESPONSES PARA API
// ============================================

type VendaResponse struct {
	ID                    uint                `json:"id"`
	NumeroVenda           string              `json:"numero_venda"`
	ClienteID             *uint               `json:"cliente_id"`
	Cliente               *ClienteResumo      `json:"cliente,omitempty"`
	UsuarioID             uint                `json:"usuario_id"`
	Usuario               *UsuarioResumo      `json:"usuario,omitempty"`
	NaturezaOpID          uint                `json:"natureza_op_id"`
	NaturezaOperacao      *NaturezaOpResumo   `json:"natureza_operacao,omitempty"`
	TotalProdutos         float64             `json:"total_produtos"`
	TotalDesconto         float64             `json:"total_desconto"`
	TotalVenda            float64             `json:"total_venda"`
	Status                string              `json:"status"`
	NFCeNumero            *string             `json:"nfce_numero"`
	NFCeChave             *string             `json:"nfce_chave"`
	NFCeStatus            string              `json:"nfce_status"`
	NFCeProtocolo         *string             `json:"nfce_protocolo"`
	NFCeDataAut           *time.Time          `json:"nfce_data_aut"`
	FormaPagamento        int                 `json:"forma_pagamento"`
	DescricaoFormaPagto   string              `json:"descricao_forma_pagamento"`
	ValorPago             float64             `json:"valor_pago"`
	ValorTroco            float64             `json:"valor_troco"`
	Observacoes           string              `json:"observacoes"`
	CreatedAt             time.Time           `json:"created_at"`
	UpdatedAt             time.Time           `json:"updated_at"`
	Itens                 []ItemVendaResponse `json:"itens,omitempty"`
	CanEmitirNFCe         bool                `json:"can_emitir_nfce"`
	CanCancelarNFCe       bool                `json:"can_cancelar_nfce"`
}

type ItemVendaResponse struct {
	ID         uint            `json:"id"`
	VendaID    uint            `json:"venda_id"`
	ProdutoID  uint            `json:"produto_id"`
	Produto    *ProdutoResumo  `json:"produto,omitempty"`
	Quantidade float64         `json:"quantidade"`
	ValorUnit  float64         `json:"valor_unit"`
	ValorDesc  float64         `json:"valor_desc"`
	ValorTotal float64         `json:"valor_total"`
}

type ClienteResumo struct {
	ID    uint   `json:"id"`
	Nome  string `json:"nome"`
	Email string `json:"email"`
	CPF   string `json:"cpf"`
	CNPJ  string `json:"cnpj"`
}

type UsuarioResumo struct {
	ID    uint   `json:"id"`
	Nome  string `json:"nome"`
	Email string `json:"email"`
}

type NaturezaOpResumo struct {
	ID        uint   `json:"id"`
	Codigo    string `json:"codigo"`
	Descricao string `json:"descricao"`
}

type ProdutoResumo struct {
	ID     uint    `json:"id"`
	Nome   string  `json:"nome"`
	Codigo string  `json:"codigo"`
	Preco  float64 `json:"preco"`
	NCM    string  `json:"ncm"`
}

type NFCeResponse struct {
	Sucesso           bool       `json:"sucesso"`
	Mensagem          string     `json:"mensagem"`
	ChaveAcesso       *string    `json:"chave_acesso"`
	Numero            *string    `json:"numero"`
	Serie             *string    `json:"serie"`
	ProtocoloAut      *string    `json:"protocolo_autorizacao"`
	DataAutorizacao   *time.Time `json:"data_autorizacao"`
	Status            string     `json:"status"`
	Erros             []string   `json:"erros,omitempty"`
	Avisos            []string   `json:"avisos,omitempty"`
}

// ============================================
// FILTROS PARA CONSULTA
// ============================================

type VendaFilter struct {
	Status         string     `json:"status"`
	NFCeStatus     string     `json:"nfce_status"`
	ClienteID      *uint      `json:"cliente_id"`
	UsuarioID      *uint      `json:"usuario_id"`
	DataInicio     *time.Time `json:"data_inicio"`
	DataFim        *time.Time `json:"data_fim"`
	NumeroVenda    string     `json:"numero_venda"`
	NFCeChave      string     `json:"nfce_chave"`
	Limit          int        `json:"limit"`
	Offset         int        `json:"offset"`
}
