package models

import (
	"time"
	"gorm.io/gorm"
)

// ============================================
// TABELAS FISCAIS AUXILIARES
// ============================================

// NCM - Nomenclatura Comum do Mercosul
type NCM struct {
	ID          uint           `gorm:"primaryKey;column:id" json:"id"`
	Codigo      string         `gorm:"size:8;uniqueIndex;not null;column:codigo" json:"codigo"` // 8 dígitos
	Descricao   string         `gorm:"type:text;not null;column:descricao" json:"descricao"`
	UnidadeTrib string         `gorm:"size:6;column:unidade_trib" json:"unidade_trib"` // Unidade tributável
	AliquotaIPI float64        `gorm:"type:decimal(5,2);default:0;column:aliquota_ipi" json:"aliquota_ipi"`
	Ativo       bool           `gorm:"default:true;column:ativo" json:"ativo"`
	CreatedAt   time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}

func (NCM) TableName() string {
	return "ncms"
}

// CFOP já está definido em natureza_operacao.go

// CST - Código de Situação Tributária
type CST struct {
	ID          uint           `gorm:"primaryKey;column:id" json:"id"`
	Codigo      string         `gorm:"size:3;uniqueIndex;not null;column:codigo" json:"codigo"` // 3 dígitos
	Descricao   string         `gorm:"type:text;not null;column:descricao" json:"descricao"`
	Tipo        string         `gorm:"size:20;not null;column:tipo" json:"tipo"` // ICMS, IPI, PIS, COFINS
	Origem      int            `gorm:"column:origem" json:"origem"` // 0-9 para ICMS
	Tributacao  string         `gorm:"size:50;column:tributacao" json:"tributacao"` // Tributado, Isento, etc
	Observacoes string         `gorm:"type:text;column:observacoes" json:"observacoes"`
	Ativo       bool           `gorm:"default:true;column:ativo" json:"ativo"`
	CreatedAt   time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}

func (CST) TableName() string {
	return "csts"
}

// CSOSN - Código de Situação da Operação no Simples Nacional
type CSOSN struct {
	ID          uint           `gorm:"primaryKey;column:id" json:"id"`
	Codigo      string         `gorm:"size:3;uniqueIndex;not null;column:codigo" json:"codigo"` // 3 dígitos
	Descricao   string         `gorm:"type:text;not null;column:descricao" json:"descricao"`
	Tributacao  string         `gorm:"size:50;column:tributacao" json:"tributacao"`
	Observacoes string         `gorm:"type:text;column:observacoes" json:"observacoes"`
	Ativo       bool           `gorm:"default:true;column:ativo" json:"ativo"`
	CreatedAt   time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}

func (CSOSN) TableName() string {
	return "csosns"
}

// CEST - Código Especificador da Substituição Tributária
type CEST struct {
	ID          uint           `gorm:"primaryKey;column:id" json:"id"`
	Codigo      string         `gorm:"size:7;uniqueIndex;not null;column:codigo" json:"codigo"` // 7 dígitos
	NCM         string         `gorm:"size:8;not null;index;column:ncm" json:"ncm"` // NCM relacionado
	Descricao   string         `gorm:"type:text;not null;column:descricao" json:"descricao"`
	Observacoes string         `gorm:"type:text;column:observacoes" json:"observacoes"`
	Ativo       bool           `gorm:"default:true;column:ativo" json:"ativo"`
	CreatedAt   time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}

func (CEST) TableName() string {
	return "cests"
}

// UnidadeMedida - Unidades de medida para produtos
type UnidadeMedida struct {
	ID        uint           `gorm:"primaryKey;column:id" json:"id"`
	Codigo    string         `gorm:"size:6;uniqueIndex;not null;column:codigo" json:"codigo"` // UN, KG, M, etc
	Descricao string         `gorm:"size:100;not null;column:descricao" json:"descricao"`
	Ativo     bool           `gorm:"default:true;column:ativo" json:"ativo"`
	CreatedAt time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}

func (UnidadeMedida) TableName() string {
	return "unidades_medida"
}

// TabelaFiscalMetadata - Controla sincronização das tabelas fiscais
type TabelaFiscalMetadata struct {
	ID             uint      `gorm:"primaryKey;column:id" json:"id"`
	Tabela         string    `gorm:"size:50;uniqueIndex;not null;column:tabela" json:"tabela"` // ncm, cfop, cst, etc
	UltimaSync     time.Time `gorm:"column:ultima_sync" json:"ultima_sync"`
	VersaoAPI      string    `gorm:"size:20;column:versao_api" json:"versao_api"`
	TotalRegistros int       `gorm:"column:total_registros" json:"total_registros"`
	FonteDados     string    `gorm:"size:100;column:fonte_dados" json:"fonte_dados"` // URL da API ou fonte
	CreatedAt      time.Time `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
}

func (TabelaFiscalMetadata) TableName() string {
	return "tabelas_fiscais_metadata"
}

// ============================================
// ESTRUTURAS PARA SYNC DE DADOS
// ============================================

// NCMResponse - Estrutura da API da Receita Federal
type NCMResponse struct {
	Codigo      string `json:"codigo"`
	Descricao   string `json:"descricao"`
	DataInicio  string `json:"data_inicio"`
	DataFim     string `json:"data_fim"`
	TipoAto     string `json:"tipo_ato"`
	NumeroAto   string `json:"numero_ato"`
	AnoAto      string `json:"ano_ato"`
}

// ============================================
// DADOS INICIAIS PARA SEED
// ============================================

// CFOPsComuns já está definido em natureza_operacao.go

// CSTsComuns - CSTs mais utilizados para seed inicial
var CSTsComuns = []CST{
	{Codigo: "000", Descricao: "Tributada integralmente", Tipo: "ICMS", Origem: 0, Tributacao: "Tributado"},
	{Codigo: "010", Descricao: "Tributada e com cobrança do ICMS por substituição tributária", Tipo: "ICMS", Origem: 0, Tributacao: "Substituição Tributária"},
	{Codigo: "020", Descricao: "Com redução de base de cálculo", Tipo: "ICMS", Origem: 0, Tributacao: "Tributado com Redução"},
	{Codigo: "030", Descricao: "Isenta ou não tributada e com cobrança do ICMS por substituição tributária", Tipo: "ICMS", Origem: 0, Tributacao: "Isento/NT com ST"},
	{Codigo: "040", Descricao: "Isenta", Tipo: "ICMS", Origem: 0, Tributacao: "Isento"},
	{Codigo: "041", Descricao: "Não tributada", Tipo: "ICMS", Origem: 0, Tributacao: "Não Tributado"},
	{Codigo: "050", Descricao: "Suspensão", Tipo: "ICMS", Origem: 0, Tributacao: "Suspenso"},
	{Codigo: "051", Descricao: "Diferimento", Tipo: "ICMS", Origem: 0, Tributacao: "Diferido"},
	{Codigo: "060", Descricao: "ICMS cobrado anteriormente por substituição tributária", Tipo: "ICMS", Origem: 0, Tributacao: "ST Anterior"},
	{Codigo: "070", Descricao: "Com redução de base de cálculo e cobrança do ICMS por substituição tributária", Tipo: "ICMS", Origem: 0, Tributacao: "Redução com ST"},
	{Codigo: "090", Descricao: "Outras", Tipo: "ICMS", Origem: 0, Tributacao: "Outras"},
}

// CSOSNsComuns - CSOSNs do Simples Nacional para seed inicial
var CSOSNsComuns = []CSOSN{
	{Codigo: "101", Descricao: "Tributada pelo Simples Nacional com permissão de crédito", Tributacao: "Tributado SN"},
	{Codigo: "102", Descricao: "Tributada pelo Simples Nacional sem permissão de crédito", Tributacao: "Tributado SN"},
	{Codigo: "103", Descricao: "Isenção do ICMS no Simples Nacional para faixa de receita bruta", Tributacao: "Isento SN"},
	{Codigo: "201", Descricao: "Tributada pelo Simples Nacional com permissão de crédito e com cobrança do ICMS por substituição tributária", Tributacao: "Tributado SN com ST"},
	{Codigo: "202", Descricao: "Tributada pelo Simples Nacional sem permissão de crédito e com cobrança do ICMS por substituição tributária", Tributacao: "Tributado SN com ST"},
	{Codigo: "203", Descricao: "Isenção do ICMS no Simples Nacional para faixa de receita bruta e com cobrança do ICMS por substituição tributária", Tributacao: "Isento SN com ST"},
	{Codigo: "300", Descricao: "Imune", Tributacao: "Imune"},
	{Codigo: "400", Descricao: "Não tributada pelo Simples Nacional", Tributacao: "Não Tributado SN"},
	{Codigo: "500", Descricao: "ICMS cobrado anteriormente por substituição tributária (substituído) ou por antecipação", Tributacao: "ST Anterior"},
	{Codigo: "900", Descricao: "Outros", Tributacao: "Outros SN"},
}

// UnidadesMedidaComuns - Unidades de medida mais utilizadas
var UnidadesMedidaComuns = []UnidadeMedida{
	{Codigo: "UN", Descricao: "Unidade"},
	{Codigo: "KG", Descricao: "Quilograma"},
	{Codigo: "G", Descricao: "Grama"},
	{Codigo: "L", Descricao: "Litro"},
	{Codigo: "ML", Descricao: "Mililitro"},
	{Codigo: "M", Descricao: "Metro"},
	{Codigo: "CM", Descricao: "Centímetro"},
	{Codigo: "M2", Descricao: "Metro Quadrado"},
	{Codigo: "M3", Descricao: "Metro Cúbico"},
	{Codigo: "PC", Descricao: "Peça"},
	{Codigo: "PAR", Descricao: "Par"},
	{Codigo: "CX", Descricao: "Caixa"},
	{Codigo: "PCT", Descricao: "Pacote"},
	{Codigo: "FD", Descricao: "Fardo"},
	{Codigo: "SC", Descricao: "Saco"},
}

// ============================================
// REQUESTS PARA API
// ============================================

type SyncTabelaFiscalRequest struct {
	Tabela     string `json:"tabela" binding:"required,oneof=ncm cfop cst csosn cest"`
	ForcarSync bool   `json:"forcar_sync"`
}

type BuscarNCMRequest struct {
	Codigo   string `json:"codigo" binding:"omitempty,len=8"`
	Descricao string `json:"descricao" binding:"omitempty,min=3"`
	Limit    int    `json:"limit" binding:"omitempty,min=1,max=100"`
}

type BuscarCFOPRequest struct {
	Codigo    string `json:"codigo" binding:"omitempty,len=4"`
	Descricao string `json:"descricao" binding:"omitempty,min=3"`
	Aplicacao string `json:"aplicacao" binding:"omitempty,oneof=Entrada Saída Ambos"`
	Limit     int    `json:"limit" binding:"omitempty,min=1,max=100"`
}
