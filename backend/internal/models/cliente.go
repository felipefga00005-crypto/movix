package models

import (
	"time"

	"gorm.io/gorm"
)

// ============================================
// MODELO PRINCIPAL - CLIENTE
// Modelagem completa alinhada com NF-e (bloco <dest>)
// ============================================

type Cliente struct {
	ID uint `gorm:"primaryKey;column:id" json:"id"`

	// ============================================
	// IDENTIFICAÇÃO FISCAL
	// ============================================
	TipoPessoa    string `gorm:"size:2;not null;default:'PF';column:tipo_pessoa" json:"tipo_pessoa"`       // PF ou PJ
	CNPJCPF       string `gorm:"uniqueIndex;size:18;not null;column:cnpj_cpf" json:"cnpj_cpf"`             // CPF (11) ou CNPJ (14)
	IE            string `gorm:"size:20;column:ie" json:"ie"`                                              // Inscrição Estadual ou RG
	IM            string `gorm:"size:20;column:im" json:"im"`                                              // Inscrição Municipal
	IndIEDest     int    `gorm:"default:9;column:ind_ie_dest" json:"ind_ie_dest"`                         // 1=Contribuinte, 2=Isento, 9=Não Contribuinte

	// ============================================
	// DADOS CADASTRAIS
	// ============================================
	RazaoSocial   string `gorm:"size:200;not null;index;column:razao_social" json:"razao_social"`         // Nome completo (PF) ou Razão Social (PJ)
	NomeFantasia  string `gorm:"size:200;column:nome_fantasia" json:"nome_fantasia"`                      // Nome fantasia

	// ============================================
	// CLASSIFICAÇÃO E STATUS
	// ============================================
	ConsumidorFinal bool   `gorm:"default:true;column:consumidor_final" json:"consumidor_final"`          // Indica se é consumidor final (NF-e indFinal)
	TipoContato     string `gorm:"size:50;default:'Cliente';index;column:tipo_contato" json:"tipo_contato"` // Cliente, Fornecedor, Transportadora, etc.
	Status          string `gorm:"size:20;default:'Ativo';index;column:status" json:"status"`             // Ativo, Inativo

	// ============================================
	// CONTATOS
	// ============================================
	Email           string `gorm:"size:200;index;column:email" json:"email"`
	Fone            string `gorm:"size:20;column:fone" json:"fone"`                                       // Telefone fixo principal
	Celular         string `gorm:"size:20;column:celular" json:"celular"`
	PontoReferencia string `gorm:"size:300;column:ponto_referencia" json:"ponto_referencia"`

	// ============================================
	// ENDEREÇO PRINCIPAL (FISCAL)
	// Corresponde ao bloco <enderDest> da NF-e
	// ============================================
	Logradouro  string `gorm:"size:300;column:logradouro" json:"logradouro"`                             // xLgr
	Numero      string `gorm:"size:20;column:numero" json:"numero"`                                      // nro
	Complemento string `gorm:"size:100;column:complemento" json:"complemento"`                           // xCpl
	Bairro      string `gorm:"size:100;column:bairro" json:"bairro"`                                     // xBairro
	CodigoIBGE  string `gorm:"size:10;column:codigo_ibge" json:"codigo_ibge"`                            // cMun
	Municipio   string `gorm:"size:100;column:municipio" json:"municipio"`                               // xMun
	UF          string `gorm:"size:2;column:uf" json:"uf"`                                               // UF
	CEP         string `gorm:"size:10;column:cep" json:"cep"`                                            // CEP
	CodigoPais  string `gorm:"size:10;default:'1058';column:codigo_pais" json:"codigo_pais"`             // cPais (1058 = Brasil)
	Pais        string `gorm:"size:60;default:'BRASIL';column:pais" json:"pais"`                         // xPais

	// ============================================
	// ENDEREÇO DE ENTREGA (ALTERNATIVO)
	// ============================================
	LogradouroEntrega  string `gorm:"size:300;column:logradouro_entrega" json:"logradouro_entrega"`
	NumeroEntrega      string `gorm:"size:20;column:numero_entrega" json:"numero_entrega"`
	ComplementoEntrega string `gorm:"size:100;column:complemento_entrega" json:"complemento_entrega"`
	BairroEntrega      string `gorm:"size:100;column:bairro_entrega" json:"bairro_entrega"`
	CodigoIBGEEntrega  string `gorm:"size:10;column:codigo_ibge_entrega" json:"codigo_ibge_entrega"`
	MunicipioEntrega   string `gorm:"size:100;column:municipio_entrega" json:"municipio_entrega"`
	UFEntrega          string `gorm:"size:2;column:uf_entrega" json:"uf_entrega"`
	CEPEntrega         string `gorm:"size:10;column:cep_entrega" json:"cep_entrega"`
	CodigoPaisEntrega  string `gorm:"size:10;default:'1058';column:codigo_pais_entrega" json:"codigo_pais_entrega"`
	PaisEntrega        string `gorm:"size:60;default:'BRASIL';column:pais_entrega" json:"pais_entrega"`

	// ============================================
	// DADOS FINANCEIROS
	// ============================================
	LimiteCredito  float64 `gorm:"type:decimal(15,2);default:0;column:limite_credito" json:"limite_credito"`
	SaldoInicial   float64 `gorm:"type:decimal(15,2);default:0;column:saldo_inicial" json:"saldo_inicial"`
	PrazoPagamento int     `gorm:"default:0;column:prazo_pagamento" json:"prazo_pagamento"` // Prazo em dias

	// ============================================
	// DATAS IMPORTANTES
	// ============================================
	DataNascimento *time.Time `gorm:"column:data_nascimento" json:"data_nascimento"` // Para PF
	DataAbertura   *time.Time `gorm:"column:data_abertura" json:"data_abertura"`     // Para PJ
	UltimaCompra   *time.Time `gorm:"column:ultima_compra" json:"ultima_compra"`

	// ============================================
	// CAMPOS DE AUDITORIA (GORM)
	// ============================================
	CreatedAt time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`

	// ============================================
	// RELACIONAMENTOS
	// ============================================
	CamposPersonalizados []ClienteCampoPersonalizado `gorm:"foreignKey:ClienteID;constraint:OnDelete:CASCADE" json:"campos_personalizados,omitempty"`
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

// ============================================
// TABLE NAMES
// ============================================

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
	if c.TipoPessoa == "" {
		c.TipoPessoa = "PF"
	}
	if c.IndIEDest == 0 {
		c.IndIEDest = 9 // Não contribuinte por padrão
	}
	if c.CodigoPais == "" {
		c.CodigoPais = "1058" // Brasil
	}
	if c.Pais == "" {
		c.Pais = "BRASIL"
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
// DTOs PARA API
// ============================================

// DTO para campos personalizados
type CampoPersonalizadoDTO struct {
	ID    uint   `json:"id,omitempty"`
	Nome  string `json:"nome" binding:"required"`
	Valor string `json:"valor"`
	Ordem int    `json:"ordem"`
}

// CreateClienteRequest - DTO para criação de cliente
type CreateClienteRequest struct {
	// Identificação Fiscal
	TipoPessoa    string `json:"tipoPessoa" binding:"required,oneof=PF PJ"`
	CNPJCPF       string `json:"cnpjCpf" binding:"required"`
	IE            string `json:"ie"`
	IM            string `json:"im"`
	IndIEDest     int    `json:"indIeDest"`

	// Dados Cadastrais
	RazaoSocial   string `json:"razaoSocial" binding:"required"`
	NomeFantasia  string `json:"nomeFantasia"`

	// Classificação
	ConsumidorFinal bool   `json:"consumidorFinal"`
	TipoContato     string `json:"tipoContato"`
	Status          string `json:"status"`

	// Contatos
	Email           string `json:"email"`
	Fone            string `json:"fone"`
	Celular         string `json:"celular"`
	PontoReferencia string `json:"pontoReferencia"`

	// Endereço Principal
	Logradouro  string `json:"logradouro"`
	Numero      string `json:"numero"`
	Complemento string `json:"complemento"`
	Bairro      string `json:"bairro"`
	CodigoIBGE  string `json:"codigoIbge"`
	Municipio   string `json:"municipio"`
	UF          string `json:"uf"`
	CEP         string `json:"cep"`
	CodigoPais  string `json:"codigoPais"`
	Pais        string `json:"pais"`

	// Endereço de Entrega
	LogradouroEntrega  string `json:"logradouroEntrega"`
	NumeroEntrega      string `json:"numeroEntrega"`
	ComplementoEntrega string `json:"complementoEntrega"`
	BairroEntrega      string `json:"bairroEntrega"`
	CodigoIBGEEntrega  string `json:"codigoIbgeEntrega"`
	MunicipioEntrega   string `json:"municipioEntrega"`
	UFEntrega          string `json:"ufEntrega"`
	CEPEntrega         string `json:"cepEntrega"`
	CodigoPaisEntrega  string `json:"codigoPaisEntrega"`
	PaisEntrega        string `json:"paisEntrega"`

	// Dados Financeiros
	LimiteCredito  float64 `json:"limiteCredito"`
	SaldoInicial   float64 `json:"saldoInicial"`
	PrazoPagamento int     `json:"prazoPagamento"`

	// Datas
	DataNascimento string `json:"dataNascimento"` // Formato: YYYY-MM-DD
	DataAbertura   string `json:"dataAbertura"`   // Formato: YYYY-MM-DD

	// Campos Personalizados
	CamposPersonalizados []CampoPersonalizadoDTO `json:"camposPersonalizados"`
}

// UpdateClienteRequest - DTO para atualização de cliente
type UpdateClienteRequest struct {
	// Identificação Fiscal
	TipoPessoa    *string `json:"tipoPessoa"`
	CNPJCPF       *string `json:"cnpjCpf"`
	IE            *string `json:"ie"`
	IM            *string `json:"im"`
	IndIEDest     *int    `json:"indIeDest"`

	// Dados Cadastrais
	RazaoSocial   *string `json:"razaoSocial"`
	NomeFantasia  *string `json:"nomeFantasia"`

	// Classificação
	ConsumidorFinal *bool   `json:"consumidorFinal"`
	TipoContato     *string `json:"tipoContato"`
	Status          *string `json:"status"`

	// Contatos
	Email           *string `json:"email"`
	Fone            *string `json:"fone"`
	Celular         *string `json:"celular"`
	PontoReferencia *string `json:"pontoReferencia"`

	// Endereço Principal
	Logradouro  *string `json:"logradouro"`
	Numero      *string `json:"numero"`
	Complemento *string `json:"complemento"`
	Bairro      *string `json:"bairro"`
	CodigoIBGE  *string `json:"codigoIbge"`
	Municipio   *string `json:"municipio"`
	UF          *string `json:"uf"`
	CEP         *string `json:"cep"`
	CodigoPais  *string `json:"codigoPais"`
	Pais        *string `json:"pais"`

	// Endereço de Entrega
	LogradouroEntrega  *string `json:"logradouroEntrega"`
	NumeroEntrega      *string `json:"numeroEntrega"`
	ComplementoEntrega *string `json:"complementoEntrega"`
	BairroEntrega      *string `json:"bairroEntrega"`
	CodigoIBGEEntrega  *string `json:"codigoIbgeEntrega"`
	MunicipioEntrega   *string `json:"municipioEntrega"`
	UFEntrega          *string `json:"ufEntrega"`
	CEPEntrega         *string `json:"cepEntrega"`
	CodigoPaisEntrega  *string `json:"codigoPaisEntrega"`
	PaisEntrega        *string `json:"paisEntrega"`

	// Dados Financeiros
	LimiteCredito  *float64 `json:"limiteCredito"`
	SaldoInicial   *float64 `json:"saldoInicial"`
	PrazoPagamento *int     `json:"prazoPagamento"`

	// Datas
	DataNascimento *string `json:"dataNascimento"` // Formato: YYYY-MM-DD
	DataAbertura   *string `json:"dataAbertura"`   // Formato: YYYY-MM-DD

	// Campos Personalizados
	CamposPersonalizados []CampoPersonalizadoDTO `json:"camposPersonalizados"`
}

// ============================================
// MÉTODOS AUXILIARES
// ============================================

// IsPessoaFisica verifica se o cliente é pessoa física
func (c *Cliente) IsPessoaFisica() bool {
	return c.TipoPessoa == "PF"
}

// IsPessoaJuridica verifica se o cliente é pessoa jurídica
func (c *Cliente) IsPessoaJuridica() bool {
	return c.TipoPessoa == "PJ"
}

// GetNomeCompleto retorna o nome apropriado baseado no tipo de pessoa
func (c *Cliente) GetNomeCompleto() string {
	if c.NomeFantasia != "" {
		return c.NomeFantasia
	}
	return c.RazaoSocial
}

// IsContribuinteICMS verifica se o cliente é contribuinte de ICMS
func (c *Cliente) IsContribuinteICMS() bool {
	return c.IndIEDest == 1
}

// GetEnderecoCompleto retorna o endereço principal formatado
func (c *Cliente) GetEnderecoCompleto() string {
	endereco := c.Logradouro
	if c.Numero != "" {
		endereco += ", " + c.Numero
	}
	if c.Complemento != "" {
		endereco += " - " + c.Complemento
	}
	if c.Bairro != "" {
		endereco += " - " + c.Bairro
	}
	if c.Municipio != "" && c.UF != "" {
		endereco += " - " + c.Municipio + "/" + c.UF
	}
	if c.CEP != "" {
		endereco += " - CEP: " + c.CEP
	}
	return endereco
}

// TemEnderecoEntrega verifica se há endereço de entrega cadastrado
func (c *Cliente) TemEnderecoEntrega() bool {
	return c.LogradouroEntrega != "" || c.CEPEntrega != ""
}

// ============================================
// MÉTODOS DE VALIDAÇÃO
// ============================================

// ValidarCNPJCPF valida o formato básico do CNPJ/CPF
func (c *Cliente) ValidarCNPJCPF() error {
	if c.CNPJCPF == "" {
		return nil // Validação mais rigorosa deve ser feita no service
	}

	// Remove caracteres não numéricos
	cnpjCpfLimpo := ""
	for _, char := range c.CNPJCPF {
		if char >= '0' && char <= '9' {
			cnpjCpfLimpo += string(char)
		}
	}

	// Valida tamanho
	if c.TipoPessoa == "PF" && len(cnpjCpfLimpo) != 11 {
		return gorm.ErrInvalidData
	}
	if c.TipoPessoa == "PJ" && len(cnpjCpfLimpo) != 14 {
		return gorm.ErrInvalidData
	}

	return nil
}

