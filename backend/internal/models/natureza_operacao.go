package models

import (
	"time"
	"gorm.io/gorm"
)

// NaturezaOperacao representa uma natureza de operação fiscal (CFOP)
type NaturezaOperacao struct {
	ID                     uint           `gorm:"primaryKey;column:id" json:"id"`
	Codigo                 string         `gorm:"uniqueIndex;size:10;not null;column:codigo" json:"codigo"`
	Descricao              string         `gorm:"size:200;not null;column:descricao" json:"descricao"`
	CFOPDentroEstado       string         `gorm:"size:4;not null;column:cfop_dentro_estado" json:"cfop_dentro_estado"`
	CFOPForaEstado         string         `gorm:"size:4;not null;column:cfop_fora_estado" json:"cfop_fora_estado"`
	CFOPExterior           string         `gorm:"size:4;column:cfop_exterior" json:"cfop_exterior"`
	FinalidadeNFe          int            `gorm:"default:1;column:finalidade_nfe" json:"finalidade_nfe"` // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
	TipoOperacao           int            `gorm:"default:1;column:tipo_operacao" json:"tipo_operacao"`   // 0=Entrada, 1=Saída
	MovimentaEstoque       bool           `gorm:"default:true;column:movimenta_estoque" json:"movimenta_estoque"`
	GeraFinanceiro         bool           `gorm:"default:true;column:gera_financeiro" json:"gera_financeiro"`
	GeraComissao           bool           `gorm:"default:false;column:gera_comissao" json:"gera_comissao"`
	SobrescreveCFOP        bool           `gorm:"default:false;column:sobrescreve_cfop" json:"sobrescreve_cfop"`
	Bonificacao            bool           `gorm:"default:false;column:bonificacao" json:"bonificacao"`
	Observacoes            string         `gorm:"type:text;column:observacoes" json:"observacoes"`
	Ativo                  bool           `gorm:"default:true;column:ativo" json:"ativo"`
	CreatedAt              time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt              time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt              gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}

func (NaturezaOperacao) TableName() string {
	return "naturezas_operacao"
}

// GetCFOP retorna o CFOP apropriado baseado na UF de destino
func (n *NaturezaOperacao) GetCFOP(ufOrigem, ufDestino string) string {
	if ufDestino == "" {
		return n.CFOPDentroEstado // Padrão para dentro do estado
	}
	
	if ufOrigem == ufDestino {
		return n.CFOPDentroEstado
	}
	
	// Verificar se é exterior (código de país diferente de Brasil)
	if len(ufDestino) > 2 {
		if n.CFOPExterior != "" {
			return n.CFOPExterior
		}
		return n.CFOPForaEstado // Fallback
	}
	
	return n.CFOPForaEstado
}

// IsEntrada verifica se é operação de entrada
func (n *NaturezaOperacao) IsEntrada() bool {
	return n.TipoOperacao == 0
}

// IsSaida verifica se é operação de saída
func (n *NaturezaOperacao) IsSaida() bool {
	return n.TipoOperacao == 1
}

// GetDescricaoFinalidade retorna a descrição da finalidade da NFe
func (n *NaturezaOperacao) GetDescricaoFinalidade() string {
	finalidades := map[int]string{
		1: "Normal",
		2: "Complementar",
		3: "Ajuste",
		4: "Devolução",
	}
	return finalidades[n.FinalidadeNFe]
}

// GetDescricaoTipoOperacao retorna a descrição do tipo de operação
func (n *NaturezaOperacao) GetDescricaoTipoOperacao() string {
	if n.IsEntrada() {
		return "Entrada"
	}
	return "Saída"
}

// CFOP representa um código fiscal de operação e prestação
type CFOP struct {
	ID          uint           `gorm:"primaryKey;column:id" json:"id"`
	Codigo      string         `gorm:"uniqueIndex;size:4;not null;column:codigo" json:"codigo"`
	Descricao   string         `gorm:"type:text;not null;column:descricao" json:"descricao"`
	Aplicacao   string         `gorm:"size:100;column:aplicacao" json:"aplicacao"` // Entrada, Saída, Ambos
	Observacoes string         `gorm:"type:text;column:observacoes" json:"observacoes"`
	Ativo       bool           `gorm:"default:true;column:ativo" json:"ativo"`
	CreatedAt   time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}

func (CFOP) TableName() string {
	return "cfops"
}

// IsEntrada verifica se o CFOP é de entrada
func (c *CFOP) IsEntrada() bool {
	return c.Codigo[0] == '1' || c.Codigo[0] == '2' || c.Codigo[0] == '3'
}

// IsSaida verifica se o CFOP é de saída
func (c *CFOP) IsSaida() bool {
	return c.Codigo[0] == '5' || c.Codigo[0] == '6' || c.Codigo[0] == '7'
}

// GetTipoOperacao retorna o tipo de operação baseado no CFOP
func (c *CFOP) GetTipoOperacao() string {
	primeiro := c.Codigo[0]
	switch primeiro {
	case '1':
		return "Entrada - Dentro do Estado"
	case '2':
		return "Entrada - Fora do Estado"
	case '3':
		return "Entrada - Exterior"
	case '5':
		return "Saída - Dentro do Estado"
	case '6':
		return "Saída - Fora do Estado"
	case '7':
		return "Saída - Exterior"
	default:
		return "Desconhecido"
	}
}

// Requests para API
type CreateNaturezaOperacaoRequest struct {
	Codigo           string `json:"codigo" binding:"required,max=10"`
	Descricao        string `json:"descricao" binding:"required,max=200"`
	CFOPDentroEstado string `json:"cfop_dentro_estado" binding:"required,len=4"`
	CFOPForaEstado   string `json:"cfop_fora_estado" binding:"required,len=4"`
	CFOPExterior     string `json:"cfop_exterior" binding:"omitempty,len=4"`
	FinalidadeNFe    int    `json:"finalidade_nfe" binding:"min=1,max=4"`
	TipoOperacao     int    `json:"tipo_operacao" binding:"min=0,max=1"`
	MovimentaEstoque bool   `json:"movimenta_estoque"`
	GeraFinanceiro   bool   `json:"gera_financeiro"`
	GeraComissao     bool   `json:"gera_comissao"`
	SobrescreveCFOP  bool   `json:"sobrescreve_cfop"`
	Bonificacao      bool   `json:"bonificacao"`
	Observacoes      string `json:"observacoes"`
	Ativo            bool   `json:"ativo"`
}

type UpdateNaturezaOperacaoRequest struct {
	Codigo           *string `json:"codigo" binding:"omitempty,max=10"`
	Descricao        *string `json:"descricao" binding:"omitempty,max=200"`
	CFOPDentroEstado *string `json:"cfop_dentro_estado" binding:"omitempty,len=4"`
	CFOPForaEstado   *string `json:"cfop_fora_estado" binding:"omitempty,len=4"`
	CFOPExterior     *string `json:"cfop_exterior" binding:"omitempty,len=4"`
	FinalidadeNFe    *int    `json:"finalidade_nfe" binding:"omitempty,min=1,max=4"`
	TipoOperacao     *int    `json:"tipo_operacao" binding:"omitempty,min=0,max=1"`
	MovimentaEstoque *bool   `json:"movimenta_estoque"`
	GeraFinanceiro   *bool   `json:"gera_financeiro"`
	GeraComissao     *bool   `json:"gera_comissao"`
	SobrescreveCFOP  *bool   `json:"sobrescreve_cfop"`
	Bonificacao      *bool   `json:"bonificacao"`
	Observacoes      *string `json:"observacoes"`
	Ativo            *bool   `json:"ativo"`
}

type CreateCFOPRequest struct {
	Codigo      string `json:"codigo" binding:"required,len=4"`
	Descricao   string `json:"descricao" binding:"required"`
	Aplicacao   string `json:"aplicacao" binding:"required,oneof=Entrada Saída Ambos"`
	Observacoes string `json:"observacoes"`
	Ativo       bool   `json:"ativo"`
}

type UpdateCFOPRequest struct {
	Codigo      *string `json:"codigo" binding:"omitempty,len=4"`
	Descricao   *string `json:"descricao"`
	Aplicacao   *string `json:"aplicacao" binding:"omitempty,oneof=Entrada Saída Ambos"`
	Observacoes *string `json:"observacoes"`
	Ativo       *bool   `json:"ativo"`
}

// CFOPs mais comuns para seed inicial
var CFOPsComuns = []CFOP{
	{Codigo: "1101", Descricao: "Compra para industrialização ou produção rural", Aplicacao: "Entrada"},
	{Codigo: "1102", Descricao: "Compra para comercialização", Aplicacao: "Entrada"},
	{Codigo: "1111", Descricao: "Compra para industrialização de mercadoria recebida anteriormente em consignação industrial", Aplicacao: "Entrada"},
	{Codigo: "1113", Descricao: "Compra para comercialização, de mercadoria recebida anteriormente em consignação mercantil", Aplicacao: "Entrada"},
	{Codigo: "1116", Descricao: "Compra para industrialização ou produção rural originada de encomenda para recebimento futuro", Aplicacao: "Entrada"},
	{Codigo: "1117", Descricao: "Compra para comercialização originada de encomenda para recebimento futuro", Aplicacao: "Entrada"},
	{Codigo: "1201", Descricao: "Devolução de venda de produção do estabelecimento", Aplicacao: "Entrada"},
	{Codigo: "1202", Descricao: "Devolução de venda de mercadoria adquirida ou recebida de terceiros", Aplicacao: "Entrada"},
	{Codigo: "1203", Descricao: "Devolução de venda de produção do estabelecimento, destinada à Zona Franca de Manaus ou Áreas de Livre Comércio", Aplicacao: "Entrada"},
	{Codigo: "1204", Descricao: "Devolução de venda de mercadoria adquirida ou recebida de terceiros, destinada à Zona Franca de Manaus ou Áreas de Livre Comércio", Aplicacao: "Entrada"},
	
	{Codigo: "5101", Descricao: "Venda de produção do estabelecimento", Aplicacao: "Saída"},
	{Codigo: "5102", Descricao: "Venda de mercadoria adquirida ou recebida de terceiros", Aplicacao: "Saída"},
	{Codigo: "5103", Descricao: "Venda de produção do estabelecimento, efetuada fora do estabelecimento", Aplicacao: "Saída"},
	{Codigo: "5104", Descricao: "Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento", Aplicacao: "Saída"},
	{Codigo: "5105", Descricao: "Venda de produção do estabelecimento que não deva por ele transitar", Aplicacao: "Saída"},
	{Codigo: "5106", Descricao: "Venda de mercadoria adquirida ou recebida de terceiros, que não deva por ele transitar", Aplicacao: "Saída"},
	{Codigo: "5109", Descricao: "Venda de produção do estabelecimento, destinada à Zona Franca de Manaus ou Áreas de Livre Comércio", Aplicacao: "Saída"},
	{Codigo: "5110", Descricao: "Venda de mercadoria adquirida ou recebida de terceiros, destinada à Zona Franca de Manaus ou Áreas de Livre Comércio", Aplicacao: "Saída"},
	{Codigo: "5151", Descricao: "Transferência de produção do estabelecimento", Aplicacao: "Saída"},
	{Codigo: "5152", Descricao: "Transferência de mercadoria adquirida ou recebida de terceiros", Aplicacao: "Saída"},
	{Codigo: "5202", Descricao: "Devolução de compra para comercialização", Aplicacao: "Saída"},
	{Codigo: "5405", Descricao: "Venda de mercadoria adquirida ou recebida de terceiros sujeita ao regime de substituição tributária", Aplicacao: "Saída"},
	{Codigo: "5949", Descricao: "Outra saída de mercadoria ou prestação de serviço não especificado", Aplicacao: "Saída"},
}

// NaturezasOperacaoComuns para seed inicial
var NaturezasOperacaoComuns = []NaturezaOperacao{
	{
		Codigo:           "VENDA",
		Descricao:        "Venda de Mercadorias",
		CFOPDentroEstado: "5102",
		CFOPForaEstado:   "6102",
		FinalidadeNFe:    1,
		TipoOperacao:     1,
		MovimentaEstoque: true,
		GeraFinanceiro:   true,
		GeraComissao:     false,
		Ativo:            true,
	},
	{
		Codigo:           "COMPRA",
		Descricao:        "Compra para Comercialização",
		CFOPDentroEstado: "1102",
		CFOPForaEstado:   "2102",
		FinalidadeNFe:    1,
		TipoOperacao:     0,
		MovimentaEstoque: true,
		GeraFinanceiro:   true,
		GeraComissao:     false,
		Ativo:            true,
	},
	{
		Codigo:           "DEVOLUCAO_VENDA",
		Descricao:        "Devolução de Venda",
		CFOPDentroEstado: "1202",
		CFOPForaEstado:   "2202",
		FinalidadeNFe:    4,
		TipoOperacao:     0,
		MovimentaEstoque: true,
		GeraFinanceiro:   false,
		GeraComissao:     false,
		Ativo:            true,
	},
	{
		Codigo:           "TRANSFERENCIA",
		Descricao:        "Transferência entre Filiais",
		CFOPDentroEstado: "5152",
		CFOPForaEstado:   "6152",
		FinalidadeNFe:    1,
		TipoOperacao:     1,
		MovimentaEstoque: true,
		GeraFinanceiro:   false,
		GeraComissao:     false,
		Ativo:            true,
	},
}
