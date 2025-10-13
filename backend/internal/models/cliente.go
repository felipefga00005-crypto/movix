package models

import (
	"time"

	"gorm.io/gorm"
)

// ============================================
// MODELO PRINCIPAL OTIMIZADO
// ============================================

type Cliente struct {
	ID                    uint           `gorm:"primaryKey;column:id" json:"id"`

	// Dados Básicos
	CPF                   string         `gorm:"uniqueIndex;size:14;column:cpf" json:"cpf"`
	IeRg                  string         `gorm:"size:50;index;column:ie_rg" json:"ie_rg"` // RG para PF ou IE para PJ (unificado)
	InscricaoMunicipal    string         `gorm:"size:50;column:inscricao_municipal" json:"inscricao_municipal"`
	Nome                  string         `gorm:"size:200;not null;index;column:nome" json:"nome"`
	NomeFantasia          string         `gorm:"size:200;column:nome_fantasia" json:"nome_fantasia"`
	TipoContato           string         `gorm:"size:50;default:'Cliente';index;column:tipo_contato" json:"tipo_contato"`
	ConsumidorFinal       bool           `gorm:"default:false;column:consumidor_final" json:"consumidor_final"`

	// Contatos
	Email                 string         `gorm:"size:200;index;column:email" json:"email"`
	PontoReferencia       string         `gorm:"size:300;column:ponto_referencia" json:"ponto_referencia"`
	TelefoneFixo          string         `gorm:"size:20;column:telefone_fixo" json:"telefone_fixo"` // Telefone principal (unificado)
	TelefoneAlternativo   string         `gorm:"size:20;column:telefone_alternativo" json:"telefone_alternativo"`
	Celular               string         `gorm:"size:20;column:celular" json:"celular"`

	// Endereço Principal
	CEP                   string         `gorm:"size:10;column:cep" json:"cep"`
	Endereco              string         `gorm:"size:300;column:endereco" json:"endereco"`
	Numero                string         `gorm:"size:20;column:numero" json:"numero"`
	Complemento           string         `gorm:"size:100;column:complemento" json:"complemento"`
	Bairro                string         `gorm:"size:100;column:bairro" json:"bairro"`
	Cidade                string         `gorm:"size:100;column:cidade" json:"cidade"`
	Estado                string         `gorm:"size:2;column:estado" json:"estado"`
	CodigoIbge            string         `gorm:"size:20;column:codigo_ibge" json:"codigo_ibge"`

	// Endereço de Entrega
	CEPEntrega            string         `gorm:"size:10;column:cep_entrega" json:"cep_entrega"`
	EnderecoEntrega       string         `gorm:"size:300;column:endereco_entrega" json:"endereco_entrega"`
	NumeroEntrega         string         `gorm:"size:20;column:numero_entrega" json:"numero_entrega"`
	ComplementoEntrega    string         `gorm:"size:100;column:complemento_entrega" json:"complemento_entrega"`
	BairroEntrega         string         `gorm:"size:100;column:bairro_entrega" json:"bairro_entrega"`
	CidadeEntrega         string         `gorm:"size:100;column:cidade_entrega" json:"cidade_entrega"`
	EstadoEntrega         string         `gorm:"size:2;column:estado_entrega" json:"estado_entrega"`

	// Dados Financeiros
	LimiteCredito         string         `gorm:"size:50;column:limite_credito" json:"limite_credito"`
	SaldoInicial          string         `gorm:"size:50;default:'0';column:saldo_inicial" json:"saldo_inicial"`
	PrazoPagamento        string         `gorm:"size:50;column:prazo_pagamento" json:"prazo_pagamento"`

	// Campos de Sistema
	DataNascimento        string         `gorm:"size:10;column:data_nascimento" json:"data_nascimento"`
	DataAbertura          string         `gorm:"size:10;column:data_abertura" json:"data_abertura"` // Data de abertura da empresa
	Status                string         `gorm:"size:20;default:'Ativo';index;column:status" json:"status"` // Ativo, Inativo
	DataCadastro          time.Time      `gorm:"autoCreateTime;column:data_cadastro" json:"data_cadastro"`
	UltimaCompra          string         `gorm:"size:50;default:'Nunca comprou';column:ultima_compra" json:"ultima_compra"`
	DataAtualizacao       time.Time      `gorm:"autoUpdateTime;column:data_atualizacao" json:"data_atualizacao"`
	DeletedAt             gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`

	// Relacionamentos
	CamposPersonalizados  []ClienteCampoPersonalizado `gorm:"foreignKey:ClienteID;constraint:OnDelete:CASCADE" json:"camposPersonalizados,omitempty"`
}

// ============================================
// MODELO PARA CAMPOS PERSONALIZADOS DINÂMICOS
// ============================================

type ClienteCampoPersonalizado struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	ClienteID uint      `gorm:"not null;index;column:cliente_id" json:"cliente_id"`
	Nome      string    `gorm:"size:100;not null;column:nome" json:"nome"`
	Valor     string    `gorm:"type:text;column:valor" json:"valor"`
	Ordem     int       `gorm:"default:1;column:ordem" json:"ordem"`
	CreatedAt time.Time `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
}

func (Cliente) TableName() string {
	return "clientes"
}

func (ClienteCampoPersonalizado) TableName() string {
	return "clientes_campos_personalizados"
}

// ============================================
// HOOKS DO GORM
// ============================================

// BeforeCreate hook do GORM para Cliente
func (c *Cliente) BeforeCreate(tx *gorm.DB) error {
	// Define valores padrão
	if c.Status == "" {
		c.Status = "Ativo"
	}
	if c.UltimaCompra == "" {
		c.UltimaCompra = "Nunca comprou"
	}
	return nil
}

// BeforeCreate hook do GORM para ClienteCampoPersonalizado
func (ccp *ClienteCampoPersonalizado) BeforeCreate(tx *gorm.DB) error {
	if ccp.Ordem == 0 {
		ccp.Ordem = 1
	}
	return nil
}

// ============================================
// DTOs OTIMIZADOS
// ============================================

// DTO para campos personalizados
type CampoPersonalizadoDTO struct {
	ID    uint   `json:"id,omitempty"`
	Nome  string `json:"nome" binding:"required"`
	Valor string `json:"valor"`
	Ordem int    `json:"ordem"`
}

type CreateClienteRequest struct {
	// Dados Básicos
	CPF                   string `json:"cpf" binding:"required"`
	IeRg                  string `json:"ieRg"` // RG para PF ou IE para PJ (unificado)
	InscricaoMunicipal    string `json:"inscricaoMunicipal"`
	Nome                  string `json:"nome" binding:"required"`
	NomeFantasia          string `json:"nomeFantasia"`
	TipoContato           string `json:"tipoContato"`
	ConsumidorFinal       bool   `json:"consumidorFinal"`

	// Contatos
	Email                 string `json:"email"`
	PontoReferencia       string `json:"pontoReferencia"`
	TelefoneFixo          string `json:"telefoneFixo"` // Telefone principal (unificado)
	TelefoneAlternativo   string `json:"telefoneAlternativo"`
	Celular               string `json:"celular"`

	// Endereço Principal
	CEP                   string `json:"cep"`
	Endereco              string `json:"endereco"`
	Numero                string `json:"numero"`
	Complemento           string `json:"complemento"`
	Bairro                string `json:"bairro"`
	Cidade                string `json:"cidade"`
	Estado                string `json:"estado"`
	CodigoIbge            string `json:"codigoIbge"`

	// Endereço de Entrega
	CEPEntrega            string `json:"cepEntrega"`
	EnderecoEntrega       string `json:"enderecoEntrega"`
	NumeroEntrega         string `json:"numeroEntrega"`
	ComplementoEntrega    string `json:"complementoEntrega"`
	BairroEntrega         string `json:"bairroEntrega"`
	CidadeEntrega         string `json:"cidadeEntrega"`
	EstadoEntrega         string `json:"estadoEntrega"`

	// Dados Financeiros
	LimiteCredito         string `json:"limiteCredito"`
	SaldoInicial          string `json:"saldoInicial"`
	PrazoPagamento        string `json:"prazoPagamento"`

	// Campos Personalizados Dinâmicos
	CamposPersonalizados  []CampoPersonalizadoDTO `json:"camposPersonalizados"`

	// Campos de Sistema
	DataNascimento        string `json:"dataNascimento"`
	DataAbertura          string `json:"dataAbertura"`
	Status                string `json:"status"`
	Observacoes           string `json:"observacoes"`
}

type UpdateClienteRequest struct {
	// Dados Básicos
	CPF                   string `json:"cpf"`
	IeRg                  string `json:"ieRg"` // RG para PF ou IE para PJ (unificado)
	InscricaoMunicipal    string `json:"inscricaoMunicipal"`
	Nome                  string `json:"nome"`
	NomeFantasia          string `json:"nomeFantasia"`
	TipoContato           string `json:"tipoContato"`
	ConsumidorFinal       *bool  `json:"consumidorFinal"` // Pointer para permitir null

	// Contatos
	Email                 string `json:"email"`
	PontoReferencia       string `json:"pontoReferencia"`
	TelefoneFixo          string `json:"telefoneFixo"` // Telefone principal (unificado)
	TelefoneAlternativo   string `json:"telefoneAlternativo"`
	Celular               string `json:"celular"`

	// Endereço Principal
	CEP                   string `json:"cep"`
	Endereco              string `json:"endereco"`
	Numero                string `json:"numero"`
	Complemento           string `json:"complemento"`
	Bairro                string `json:"bairro"`
	Cidade                string `json:"cidade"`
	Estado                string `json:"estado"`
	CodigoIbge            string `json:"codigoIbge"`

	// Endereço de Entrega
	CEPEntrega            string `json:"cepEntrega"`
	EnderecoEntrega       string `json:"enderecoEntrega"`
	NumeroEntrega         string `json:"numeroEntrega"`
	ComplementoEntrega    string `json:"complementoEntrega"`
	BairroEntrega         string `json:"bairroEntrega"`
	CidadeEntrega         string `json:"cidadeEntrega"`
	EstadoEntrega         string `json:"estadoEntrega"`

	// Dados Financeiros
	LimiteCredito         string `json:"limiteCredito"`
	SaldoInicial          string `json:"saldoInicial"`
	PrazoPagamento        string `json:"prazoPagamento"`

	// Campos Personalizados Dinâmicos
	CamposPersonalizados  []CampoPersonalizadoDTO `json:"camposPersonalizados"`

	// Campos de Sistema
	DataNascimento        string `json:"dataNascimento"`
	DataAbertura          string `json:"dataAbertura"`
	Status                string `json:"status"`
	UltimaCompra          string `json:"ultimaCompra"`
	Observacoes           string `json:"observacoes"`
}

// ============================================
// MÉTODOS AUXILIARES PARA COMPATIBILIDADE
// ============================================

// GetRgIe retorna o ie_rg para compatibilidade com frontend
func (c *Cliente) GetRgIe() string {
	return c.IeRg
}

// SetRgIe define o ie_rg para compatibilidade com frontend
func (c *Cliente) SetRgIe(value string) {
	c.IeRg = value
}

// GetTelefone retorna o telefone fixo para compatibilidade com frontend
func (c *Cliente) GetTelefone() string {
	return c.TelefoneFixo
}

// SetTelefone define o telefone fixo para compatibilidade com frontend
func (c *Cliente) SetTelefone(value string) {
	c.TelefoneFixo = value
}

// GetInscricaoEstadual retorna o ie_rg para compatibilidade
func (c *Cliente) GetInscricaoEstadual() string {
	return c.IeRg
}

// SetInscricaoEstadual define o ie_rg para compatibilidade
func (c *Cliente) SetInscricaoEstadual(value string) {
	c.IeRg = value
}

