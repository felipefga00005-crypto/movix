package models

import (
	"time"

	"gorm.io/gorm"
)

// ============================================
// MODELO PRINCIPAL - FORNECEDOR
// Modelagem completa alinhada com NF-e e necessidades de compras
// ============================================

type Fornecedor struct {
	ID uint `gorm:"primaryKey;column:id" json:"id"`

	// ============================================
	// CÓDIGO INTERNO
	// ============================================
	Codigo string `gorm:"uniqueIndex;size:50;column:codigo" json:"codigo"` // Código interno gerado automaticamente

	// ============================================
	// IDENTIFICAÇÃO FISCAL
	// ============================================
	TipoPessoa string `gorm:"size:2;not null;default:'PJ';column:tipo_pessoa" json:"tipo_pessoa"` // PF ou PJ (maioria PJ)
	CNPJCPF    string `gorm:"uniqueIndex;size:18;not null;column:cnpj_cpf" json:"cnpj_cpf"`       // CPF (11) ou CNPJ (14)
	IE         string `gorm:"size:20;column:ie" json:"ie"`                                        // Inscrição Estadual
	IM         string `gorm:"size:20;column:im" json:"im"`                                        // Inscrição Municipal
	IndIEDest  int    `gorm:"default:1;column:ind_ie_dest" json:"ind_ie_dest"`                   // 1=Contribuinte (padrão para fornecedores)

	// ============================================
	// DADOS CADASTRAIS
	// ============================================
	RazaoSocial  string `gorm:"size:200;not null;index;column:razao_social" json:"razao_social"`   // Razão Social ou Nome completo
	NomeFantasia string `gorm:"size:200;column:nome_fantasia" json:"nome_fantasia"`                // Nome fantasia

	// ============================================
	// CLASSIFICAÇÃO E STATUS
	// ============================================
	Categoria string `gorm:"size:100;index;column:categoria" json:"categoria"` // Distribuidor, Fabricante, Importador, Prestador de Serviço, etc.
	Status    string `gorm:"size:20;default:'Ativo';index;column:status" json:"status"` // Ativo, Inativo, Bloqueado, Pendente

	// ============================================
	// CONTATOS
	// ============================================
	Email           string `gorm:"size:200;index;column:email" json:"email"`
	Fone            string `gorm:"size:20;column:fone" json:"fone"`       // Telefone fixo principal
	Celular         string `gorm:"size:20;column:celular" json:"celular"` // Telefone celular
	Site            string `gorm:"size:200;column:site" json:"site"`      // Website do fornecedor
	PontoReferencia string `gorm:"size:300;column:ponto_referencia" json:"ponto_referencia"`

	// ============================================
	// CONTATO PRINCIPAL (PESSOA DE CONTATO)
	// ============================================
	NomeContato     string `gorm:"size:200;column:nome_contato" json:"nome_contato"`         // Nome do responsável
	CargoContato    string `gorm:"size:100;column:cargo_contato" json:"cargo_contato"`       // Cargo do responsável
	TelefoneContato string `gorm:"size:20;column:telefone_contato" json:"telefone_contato"`  // Telefone direto
	EmailContato    string `gorm:"size:200;column:email_contato" json:"email_contato"`       // Email direto

	// ============================================
	// ENDEREÇO PRINCIPAL (FISCAL)
	// ============================================
	Logradouro string `gorm:"size:300;column:logradouro" json:"logradouro"` // xLgr
	Numero     string `gorm:"size:20;column:numero" json:"numero"`          // nro
	Complemento string `gorm:"size:100;column:complemento" json:"complemento"` // xCpl
	Bairro     string `gorm:"size:100;column:bairro" json:"bairro"`         // xBairro
	CodigoIBGE string `gorm:"size:10;column:codigo_ibge" json:"codigo_ibge"` // cMun
	Municipio  string `gorm:"size:100;column:municipio" json:"municipio"`   // xMun
	UF         string `gorm:"size:2;column:uf" json:"uf"`                   // UF
	CEP        string `gorm:"size:10;column:cep" json:"cep"`                // CEP
	CodigoPais string `gorm:"size:10;default:'1058';column:codigo_pais" json:"codigo_pais"` // cPais (1058 = Brasil)
	Pais       string `gorm:"size:60;default:'BRASIL';column:pais" json:"pais"`             // xPais

	// ============================================
	// DADOS COMERCIAIS
	// ============================================
	PrazoPagamento      int     `gorm:"default:0;column:prazo_pagamento" json:"prazo_pagamento"`           // Prazo médio em dias
	LimiteCompra        float64 `gorm:"type:decimal(15,2);default:0;column:limite_compra" json:"limite_compra"` // Limite de compra
	DescontoNegociado   float64 `gorm:"type:decimal(5,2);default:0;column:desconto_negociado" json:"desconto_negociado"` // % de desconto
	FreteMinimo         float64 `gorm:"type:decimal(15,2);default:0;column:frete_minimo" json:"frete_minimo"` // Valor mínimo de frete
	PedidoMinimo        float64 `gorm:"type:decimal(15,2);default:0;column:pedido_minimo" json:"pedido_minimo"` // Valor mínimo de pedido
	PrazoEntrega        int     `gorm:"default:0;column:prazo_entrega" json:"prazo_entrega"`               // Prazo médio de entrega em dias

	// ============================================
	// DADOS BANCÁRIOS
	// ============================================
	Banco         string `gorm:"size:100;column:banco" json:"banco"`           // Nome do banco
	Agencia       string `gorm:"size:20;column:agencia" json:"agencia"`        // Agência
	Conta         string `gorm:"size:30;column:conta" json:"conta"`            // Conta corrente
	TipoConta     string `gorm:"size:20;column:tipo_conta" json:"tipo_conta"`  // Corrente, Poupança
	PIX           string `gorm:"size:200;column:pix" json:"pix"`               // Chave PIX

	// ============================================
	// OBSERVAÇÕES E NOTAS
	// ============================================
	Observacoes string `gorm:"type:text;column:observacoes" json:"observacoes"` // Observações gerais
	Anotacoes   string `gorm:"type:text;column:anotacoes" json:"anotacoes"`     // Anotações internas

	// ============================================
	// DATAS IMPORTANTES
	// ============================================
	DataAbertura   *time.Time `gorm:"column:data_abertura" json:"data_abertura"`     // Data de abertura da empresa
	UltimaCompra   *time.Time `gorm:"column:ultima_compra" json:"ultima_compra"`     // Data da última compra
	ProximoContato *time.Time `gorm:"column:proximo_contato" json:"proximo_contato"` // Data do próximo contato agendado

	// ============================================
	// CAMPOS DE AUDITORIA (GORM)
	// ============================================
	CreatedAt time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`

	// ============================================
	// RELACIONAMENTOS
	// ============================================
	CamposPersonalizados []FornecedorCampoPersonalizado `gorm:"foreignKey:FornecedorID;constraint:OnDelete:CASCADE" json:"campos_personalizados,omitempty"`
}

// ============================================
// MODELO PARA CAMPOS PERSONALIZADOS DINÂMICOS
// ============================================

type FornecedorCampoPersonalizado struct {
	ID           uint      `gorm:"primaryKey;column:id" json:"id"`
	FornecedorID uint      `gorm:"not null;index;column:fornecedor_id" json:"fornecedor_id"`
	Nome         string    `gorm:"size:100;not null;column:nome" json:"nome"`
	Valor        string    `gorm:"type:text;column:valor" json:"valor"`
	Ordem        int       `gorm:"default:1;column:ordem" json:"ordem"`
	CreatedAt    time.Time `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
}

// ============================================
// TABLE NAMES
// ============================================

func (Fornecedor) TableName() string {
	return "fornecedores"
}

func (FornecedorCampoPersonalizado) TableName() string {
	return "fornecedores_campos_personalizados"
}

// ============================================
// HOOKS DO GORM
// ============================================

// BeforeCreate hook do GORM para Fornecedor
func (f *Fornecedor) BeforeCreate(tx *gorm.DB) error {
	// Gera código automático se não fornecido
	if f.Codigo == "" {
		f.Codigo = generateFornecedorCode()
	}

	// Define valores padrão
	if f.Status == "" {
		f.Status = "Ativo"
	}
	if f.TipoPessoa == "" {
		f.TipoPessoa = "PJ" // Maioria dos fornecedores são PJ
	}
	if f.IndIEDest == 0 {
		f.IndIEDest = 1 // Contribuinte por padrão (fornecedores geralmente são)
	}
	if f.CodigoPais == "" {
		f.CodigoPais = "1058" // Brasil
	}
	if f.Pais == "" {
		f.Pais = "BRASIL"
	}
	if f.Categoria == "" {
		f.Categoria = "Distribuidor"
	}

	return nil
}

// BeforeCreate hook do GORM para FornecedorCampoPersonalizado
func (fcp *FornecedorCampoPersonalizado) BeforeCreate(tx *gorm.DB) error {
	if fcp.Ordem == 0 {
		fcp.Ordem = 1
	}
	return nil
}

func generateFornecedorCode() string {
	return "FOR" + time.Now().Format("20060102150405")
}

// ============================================
// DTOs PARA API
// ============================================

// DTO para campos personalizados
type FornecedorCampoPersonalizadoDTO struct {
	ID    uint   `json:"id,omitempty"`
	Nome  string `json:"nome" binding:"required"`
	Valor string `json:"valor"`
	Ordem int    `json:"ordem"`
}

// CreateFornecedorRequest - DTO para criação de fornecedor
type CreateFornecedorRequest struct {
	// Identificação Fiscal
	TipoPessoa string `json:"tipoPessoa" binding:"required,oneof=PF PJ"`
	CNPJCPF    string `json:"cnpjCpf" binding:"required"`
	IE         string `json:"ie"`
	IM         string `json:"im"`
	IndIEDest  int    `json:"indIeDest"`

	// Dados Cadastrais
	RazaoSocial  string `json:"razaoSocial" binding:"required"`
	NomeFantasia string `json:"nomeFantasia"`

	// Classificação
	Categoria string `json:"categoria"`
	Status    string `json:"status"`

	// Contatos
	Email           string `json:"email"`
	Fone            string `json:"fone"`
	Celular         string `json:"celular"`
	Site            string `json:"site"`
	PontoReferencia string `json:"pontoReferencia"`

	// Contato Principal
	NomeContato     string `json:"nomeContato"`
	CargoContato    string `json:"cargoContato"`
	TelefoneContato string `json:"telefoneContato"`
	EmailContato    string `json:"emailContato"`

	// Endereço Principal
	Logradouro string `json:"logradouro"`
	Numero     string `json:"numero"`
	Complemento string `json:"complemento"`
	Bairro     string `json:"bairro"`
	CodigoIBGE string `json:"codigoIbge"`
	Municipio  string `json:"municipio"`
	UF         string `json:"uf"`
	CEP        string `json:"cep"`
	CodigoPais string `json:"codigoPais"`
	Pais       string `json:"pais"`

	// Dados Comerciais
	PrazoPagamento    int     `json:"prazoPagamento"`
	LimiteCompra      float64 `json:"limiteCompra"`
	DescontoNegociado float64 `json:"descontoNegociado"`
	FreteMinimo       float64 `json:"freteMinimo"`
	PedidoMinimo      float64 `json:"pedidoMinimo"`
	PrazoEntrega      int     `json:"prazoEntrega"`

	// Dados Bancários
	Banco     string `json:"banco"`
	Agencia   string `json:"agencia"`
	Conta     string `json:"conta"`
	TipoConta string `json:"tipoConta"`
	PIX       string `json:"pix"`

	// Observações
	Observacoes string `json:"observacoes"`
	Anotacoes   string `json:"anotacoes"`

	// Datas
	DataAbertura   string `json:"dataAbertura"`   // Formato: YYYY-MM-DD
	ProximoContato string `json:"proximoContato"` // Formato: YYYY-MM-DD

	// Campos Personalizados
	CamposPersonalizados []FornecedorCampoPersonalizadoDTO `json:"camposPersonalizados"`
}

// UpdateFornecedorRequest - DTO para atualização de fornecedor
type UpdateFornecedorRequest struct {
	// Identificação Fiscal
	TipoPessoa *string `json:"tipoPessoa"`
	CNPJCPF    *string `json:"cnpjCpf"`
	IE         *string `json:"ie"`
	IM         *string `json:"im"`
	IndIEDest  *int    `json:"indIeDest"`

	// Dados Cadastrais
	RazaoSocial  *string `json:"razaoSocial"`
	NomeFantasia *string `json:"nomeFantasia"`

	// Classificação
	Categoria *string `json:"categoria"`
	Status    *string `json:"status"`

	// Contatos
	Email           *string `json:"email"`
	Fone            *string `json:"fone"`
	Celular         *string `json:"celular"`
	Site            *string `json:"site"`
	PontoReferencia *string `json:"pontoReferencia"`

	// Contato Principal
	NomeContato     *string `json:"nomeContato"`
	CargoContato    *string `json:"cargoContato"`
	TelefoneContato *string `json:"telefoneContato"`
	EmailContato    *string `json:"emailContato"`

	// Endereço Principal
	Logradouro *string `json:"logradouro"`
	Numero     *string `json:"numero"`
	Complemento *string `json:"complemento"`
	Bairro     *string `json:"bairro"`
	CodigoIBGE *string `json:"codigoIbge"`
	Municipio  *string `json:"municipio"`
	UF         *string `json:"uf"`
	CEP        *string `json:"cep"`
	CodigoPais *string `json:"codigoPais"`
	Pais       *string `json:"pais"`

	// Dados Comerciais
	PrazoPagamento    *int     `json:"prazoPagamento"`
	LimiteCompra      *float64 `json:"limiteCompra"`
	DescontoNegociado *float64 `json:"descontoNegociado"`
	FreteMinimo       *float64 `json:"freteMinimo"`
	PedidoMinimo      *float64 `json:"pedidoMinimo"`
	PrazoEntrega      *int     `json:"prazoEntrega"`

	// Dados Bancários
	Banco     *string `json:"banco"`
	Agencia   *string `json:"agencia"`
	Conta     *string `json:"conta"`
	TipoConta *string `json:"tipoConta"`
	PIX       *string `json:"pix"`

	// Observações
	Observacoes *string `json:"observacoes"`
	Anotacoes   *string `json:"anotacoes"`

	// Datas
	DataAbertura   *string `json:"dataAbertura"`   // Formato: YYYY-MM-DD
	ProximoContato *string `json:"proximoContato"` // Formato: YYYY-MM-DD

	// Campos Personalizados
	CamposPersonalizados []FornecedorCampoPersonalizadoDTO `json:"camposPersonalizados"`
}

// ============================================
// MÉTODOS AUXILIARES
// ============================================

// IsPessoaFisica verifica se o fornecedor é pessoa física
func (f *Fornecedor) IsPessoaFisica() bool {
	return f.TipoPessoa == "PF"
}

// IsPessoaJuridica verifica se o fornecedor é pessoa jurídica
func (f *Fornecedor) IsPessoaJuridica() bool {
	return f.TipoPessoa == "PJ"
}

// GetNomeCompleto retorna o nome apropriado baseado no tipo de pessoa
func (f *Fornecedor) GetNomeCompleto() string {
	if f.NomeFantasia != "" {
		return f.NomeFantasia
	}
	return f.RazaoSocial
}

// IsContribuinteICMS verifica se o fornecedor é contribuinte de ICMS
func (f *Fornecedor) IsContribuinteICMS() bool {
	return f.IndIEDest == 1
}

// GetEnderecoCompleto retorna o endereço principal formatado
func (f *Fornecedor) GetEnderecoCompleto() string {
	endereco := f.Logradouro
	if f.Numero != "" {
		endereco += ", " + f.Numero
	}
	if f.Complemento != "" {
		endereco += " - " + f.Complemento
	}
	if f.Bairro != "" {
		endereco += " - " + f.Bairro
	}
	if f.Municipio != "" && f.UF != "" {
		endereco += " - " + f.Municipio + "/" + f.UF
	}
	if f.CEP != "" {
		endereco += " - CEP: " + f.CEP
	}
	return endereco
}

// TemDadosBancarios verifica se há dados bancários cadastrados
func (f *Fornecedor) TemDadosBancarios() bool {
	return f.Banco != "" || f.Agencia != "" || f.Conta != "" || f.PIX != ""
}

// TemContatoPrincipal verifica se há contato principal cadastrado
func (f *Fornecedor) TemContatoPrincipal() bool {
	return f.NomeContato != "" || f.EmailContato != "" || f.TelefoneContato != ""
}

// CalcularPrazoTotal retorna o prazo total (pagamento + entrega)
func (f *Fornecedor) CalcularPrazoTotal() int {
	return f.PrazoPagamento + f.PrazoEntrega
}

// ============================================
// MÉTODOS DE VALIDAÇÃO
// ============================================

// ValidarCNPJCPF valida o formato básico do CNPJ/CPF
func (f *Fornecedor) ValidarCNPJCPF() error {
	if f.CNPJCPF == "" {
		return nil // Validação mais rigorosa deve ser feita no service
	}

	// Remove caracteres não numéricos
	cnpjCpfLimpo := ""
	for _, char := range f.CNPJCPF {
		if char >= '0' && char <= '9' {
			cnpjCpfLimpo += string(char)
		}
	}

	// Valida tamanho
	if f.TipoPessoa == "PF" && len(cnpjCpfLimpo) != 11 {
		return gorm.ErrInvalidData
	}
	if f.TipoPessoa == "PJ" && len(cnpjCpfLimpo) != 14 {
		return gorm.ErrInvalidData
	}

	return nil
}

