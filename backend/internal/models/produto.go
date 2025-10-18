package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type Produto struct {
	ID              uint           `gorm:"primaryKey;column:id" json:"id"`
	Nome            string         `gorm:"size:200;not null;column:nome" json:"nome"`
	Codigo          string         `gorm:"uniqueIndex;size:50;column:codigo" json:"codigo"`
	Categoria       string         `gorm:"size:100;column:categoria" json:"categoria"`
	Subcategoria    string         `gorm:"size:100;column:subcategoria" json:"subcategoria"`
	Marca           string         `gorm:"size:100;column:marca" json:"marca"`
	Modelo          string         `gorm:"size:100;column:modelo" json:"modelo"`
	Preco           float64        `gorm:"type:decimal(10,2);column:preco" json:"preco"`
	PrecoCusto      float64        `gorm:"type:decimal(10,2);column:preco_custo" json:"preco_custo"`
	Estoque         int            `gorm:"default:0;column:estoque" json:"estoque"`
	EstoqueMinimo   int            `gorm:"default:10;column:estoque_minimo" json:"estoque_minimo"`
	Unidade         string         `gorm:"size:20;default:'UN';column:unidade" json:"unidade"` // UN, KG, L, M, etc
	Status          string         `gorm:"size:20;default:'Ativo';column:status" json:"status"`
	Fornecedor      string         `gorm:"size:200;column:fornecedor" json:"fornecedor"`
	Destaque        bool           `gorm:"default:false;column:destaque" json:"destaque"`
	Promocao        bool           `gorm:"default:false;column:promocao" json:"promocao"`
	Descricao       string         `gorm:"type:text;column:descricao" json:"descricao"`
	Peso            string         `gorm:"size:50;column:peso" json:"peso"`
	Dimensoes       string         `gorm:"size:100;column:dimensoes" json:"dimensoes"`
	Garantia        string         `gorm:"size:50;column:garantia" json:"garantia"`

	// ============================================
	// DADOS FISCAIS
	// ============================================
	NCM                string  `gorm:"size:8;column:ncm" json:"ncm"`                                    // Nomenclatura Comum do Mercosul
	CEST               string  `gorm:"size:7;column:cest" json:"cest"`                                  // Código Especificador da Substituição Tributária
	UnidadeTributavel  string  `gorm:"size:6;default:'UN';column:unidade_tributavel" json:"unidade_tributavel"` // Unidade para tributação
	OrigemProduto      int     `gorm:"default:0;column:origem_produto" json:"origem_produto"`           // 0=Nacional, 1=Estrangeira, etc.

	// Alíquotas de Impostos
	AliquotaICMS       float64 `gorm:"type:decimal(5,2);default:0;column:aliquota_icms" json:"aliquota_icms"`
	AliquotaIPI        float64 `gorm:"type:decimal(5,2);default:0;column:aliquota_ipi" json:"aliquota_ipi"`
	AliquotaPIS        float64 `gorm:"type:decimal(5,2);default:0;column:aliquota_pis" json:"aliquota_pis"`
	AliquotaCOFINS     float64 `gorm:"type:decimal(5,2);default:0;column:aliquota_cofins" json:"aliquota_cofins"`

	// Códigos de Situação Tributária
	CSTICMS            string  `gorm:"size:3;default:'000';column:cst_icms" json:"cst_icms"`            // CST ICMS
	CSTIPI             string  `gorm:"size:2;default:'99';column:cst_ipi" json:"cst_ipi"`               // CST IPI
	CSTPIS             string  `gorm:"size:2;default:'07';column:cst_pis" json:"cst_pis"`               // CST PIS
	CSTCOFINS          string  `gorm:"size:2;default:'07';column:cst_cofins" json:"cst_cofins"`         // CST COFINS
	CSOSN              string  `gorm:"size:3;column:csosn" json:"csosn"`                                // Código de Situação da Operação no Simples Nacional

	// Configurações Fiscais
	CalculaICMS        bool    `gorm:"default:true;column:calcula_icms" json:"calcula_icms"`
	CalculaIPI         bool    `gorm:"default:false;column:calcula_ipi" json:"calcula_ipi"`
	CalculaPIS         bool    `gorm:"default:true;column:calcula_pis" json:"calcula_pis"`
	CalculaCOFINS      bool    `gorm:"default:true;column:calcula_cofins" json:"calcula_cofins"`

	// Substituição Tributária
	SubstituicaoTrib   bool    `gorm:"default:false;column:substituicao_trib" json:"substituicao_trib"`
	MVA                float64 `gorm:"type:decimal(5,2);default:0;column:mva" json:"mva"`               // Margem de Valor Agregado
	AliquotaST         float64 `gorm:"type:decimal(5,2);default:0;column:aliquota_st" json:"aliquota_st"` // Alíquota ST

	// Informações Complementares
	InformacoesAdic    string  `gorm:"type:text;column:informacoes_adicionais" json:"informacoes_adicionais"`
	ObservacoesFiscais string  `gorm:"type:text;column:observacoes_fiscais" json:"observacoes_fiscais"`

	// Controle
	DataCadastro    time.Time      `gorm:"autoCreateTime;column:data_cadastro" json:"data_cadastro"`
	DataUltimaVenda string         `gorm:"size:50;column:data_ultima_venda" json:"data_ultima_venda"`
	DataAtualizacao time.Time      `gorm:"autoUpdateTime;column:data_atualizacao" json:"data_atualizacao"`
	DeletedAt       gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}

func (Produto) TableName() string {
	return "produtos"
}

// ============================================
// MÉTODOS FISCAIS
// ============================================

// IsNacional verifica se o produto é de origem nacional
func (p *Produto) IsNacional() bool {
	return p.OrigemProduto == 0
}

// IsEstrangeiro verifica se o produto é de origem estrangeira
func (p *Produto) IsEstrangeiro() bool {
	return p.OrigemProduto == 1
}

// GetDescricaoOrigemProduto retorna a descrição da origem do produto
func (p *Produto) GetDescricaoOrigemProduto() string {
	origens := map[int]string{
		0: "Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8",
		1: "Estrangeira - Importação direta, exceto a indicada no código 6",
		2: "Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7",
		3: "Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%",
		4: "Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos",
		5: "Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%",
		6: "Estrangeira - Importação direta, sem similar nacional, constante em lista da CAMEX",
		7: "Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista da CAMEX",
		8: "Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%",
	}
	if desc, exists := origens[p.OrigemProduto]; exists {
		return desc
	}
	return "Origem não definida"
}

// IsSubstituicaoTributaria verifica se o produto está sujeito à ST
func (p *Produto) IsSubstituicaoTributaria() bool {
	return p.SubstituicaoTrib
}

// GetCSTCompleto retorna o CST completo (origem + situação tributária)
func (p *Produto) GetCSTCompleto() string {
	if p.CSOSN != "" {
		// Simples Nacional usa CSOSN
		return p.CSOSN
	}
	// Regime Normal usa origem + CST
	return fmt.Sprintf("%d%s", p.OrigemProduto, p.CSTICMS)
}

// CalcularImpostos calcula os impostos do produto baseado no preço
func (p *Produto) CalcularImpostos(preco float64) map[string]float64 {
	impostos := make(map[string]float64)

	if p.CalculaICMS {
		impostos["icms"] = preco * (p.AliquotaICMS / 100)
	}

	if p.CalculaIPI {
		impostos["ipi"] = preco * (p.AliquotaIPI / 100)
	}

	if p.CalculaPIS {
		impostos["pis"] = preco * (p.AliquotaPIS / 100)
	}

	if p.CalculaCOFINS {
		impostos["cofins"] = preco * (p.AliquotaCOFINS / 100)
	}

	if p.IsSubstituicaoTributaria() {
		// Cálculo simplificado da ST
		baseCalculo := preco * (1 + (p.MVA / 100))
		impostos["st"] = baseCalculo * (p.AliquotaST / 100)
	}

	return impostos
}

// ValidarDadosFiscais valida se os dados fiscais estão corretos
func (p *Produto) ValidarDadosFiscais() []string {
	var erros []string

	// Validar NCM
	if p.NCM != "" && len(p.NCM) != 8 {
		erros = append(erros, "NCM deve ter 8 dígitos")
	}

	// Validar CEST
	if p.CEST != "" && len(p.CEST) != 7 {
		erros = append(erros, "CEST deve ter 7 dígitos")
	}

	// Validar origem
	if p.OrigemProduto < 0 || p.OrigemProduto > 8 {
		erros = append(erros, "Origem do produto deve estar entre 0 e 8")
	}

	// Validar CST ICMS
	if p.CSTICMS != "" && len(p.CSTICMS) != 3 {
		erros = append(erros, "CST ICMS deve ter 3 dígitos")
	}

	// Validar CSOSN
	if p.CSOSN != "" && len(p.CSOSN) != 3 {
		erros = append(erros, "CSOSN deve ter 3 dígitos")
	}

	// Validar alíquotas
	if p.AliquotaICMS < 0 || p.AliquotaICMS > 100 {
		erros = append(erros, "Alíquota ICMS deve estar entre 0 e 100")
	}

	return erros
}

// BeforeCreate hook do GORM
func (p *Produto) BeforeCreate(tx *gorm.DB) error {
	// Gera código automático se não fornecido
	if p.Codigo == "" {
		p.Codigo = generateProdutoCode()
	}
	
	// Define valores padrão
	if p.Status == "" {
		p.Status = "Ativo"
	}
	if p.Unidade == "" {
		p.Unidade = "UN"
	}
	if p.DataUltimaVenda == "" {
		p.DataUltimaVenda = "Nunca vendido"
	}
	
	return nil
}

func generateProdutoCode() string {
	return "PRD" + time.Now().Format("20060102150405")
}

// ============================================
// DTOs
// ============================================

type CreateProdutoRequest struct {
	// Dados Básicos
	Nome          string  `json:"nome" binding:"required"`
	Codigo        string  `json:"codigo"`
	Categoria     string  `json:"categoria"`
	Subcategoria  string  `json:"subcategoria"`
	Marca         string  `json:"marca"`
	Modelo        string  `json:"modelo"`
	Preco         float64 `json:"preco" binding:"required"`
	PrecoCusto    float64 `json:"precoCusto"`
	Estoque       int     `json:"estoque"`
	EstoqueMinimo int     `json:"estoqueMinimo"`
	Unidade       string  `json:"unidade"`
	Status        string  `json:"status"`
	Fornecedor    string  `json:"fornecedor"`
	Destaque      bool    `json:"destaque"`
	Promocao      bool    `json:"promocao"`
	Descricao     string  `json:"descricao"`
	Peso          string  `json:"peso"`
	Dimensoes     string  `json:"dimensoes"`
	Garantia      string  `json:"garantia"`

	// Dados Fiscais
	NCM                string  `json:"ncm" binding:"omitempty,len=8"`
	CEST               string  `json:"cest" binding:"omitempty,len=7"`
	UnidadeTributavel  string  `json:"unidade_tributavel"`
	OrigemProduto      int     `json:"origem_produto" binding:"min=0,max=8"`
	AliquotaICMS       float64 `json:"aliquota_icms" binding:"min=0,max=100"`
	AliquotaIPI        float64 `json:"aliquota_ipi" binding:"min=0,max=100"`
	AliquotaPIS        float64 `json:"aliquota_pis" binding:"min=0,max=100"`
	AliquotaCOFINS     float64 `json:"aliquota_cofins" binding:"min=0,max=100"`
	CSTICMS            string  `json:"cst_icms" binding:"omitempty,len=3"`
	CSTIPI             string  `json:"cst_ipi" binding:"omitempty,len=2"`
	CSTPIS             string  `json:"cst_pis" binding:"omitempty,len=2"`
	CSTCOFINS          string  `json:"cst_cofins" binding:"omitempty,len=2"`
	CSOSN              string  `json:"csosn" binding:"omitempty,len=3"`
	CalculaICMS        bool    `json:"calcula_icms"`
	CalculaIPI         bool    `json:"calcula_ipi"`
	CalculaPIS         bool    `json:"calcula_pis"`
	CalculaCOFINS      bool    `json:"calcula_cofins"`
	SubstituicaoTrib   bool    `json:"substituicao_trib"`
	MVA                float64 `json:"mva" binding:"min=0"`
	AliquotaST         float64 `json:"aliquota_st" binding:"min=0,max=100"`
	InformacoesAdic    string  `json:"informacoes_adicionais"`
	ObservacoesFiscais string  `json:"observacoes_fiscais"`
}

type UpdateProdutoRequest struct {
	// Dados Básicos
	Nome          *string  `json:"nome"`
	Categoria     *string  `json:"categoria"`
	Subcategoria  *string  `json:"subcategoria"`
	Marca         *string  `json:"marca"`
	Modelo        *string  `json:"modelo"`
	Preco         *float64 `json:"preco"`
	PrecoCusto    *float64 `json:"precoCusto"`
	Estoque       *int     `json:"estoque"`
	EstoqueMinimo *int     `json:"estoqueMinimo"`
	Unidade       *string  `json:"unidade"`
	Status        *string  `json:"status"`
	Fornecedor    *string  `json:"fornecedor"`
	Destaque      *bool    `json:"destaque"`
	Promocao      *bool    `json:"promocao"`
	Descricao     *string  `json:"descricao"`
	Peso          *string  `json:"peso"`
	Dimensoes     *string  `json:"dimensoes"`
	Garantia      *string  `json:"garantia"`

	// Dados Fiscais
	NCM                *string  `json:"ncm" binding:"omitempty,len=8"`
	CEST               *string  `json:"cest" binding:"omitempty,len=7"`
	UnidadeTributavel  *string  `json:"unidade_tributavel"`
	OrigemProduto      *int     `json:"origem_produto" binding:"omitempty,min=0,max=8"`
	AliquotaICMS       *float64 `json:"aliquota_icms" binding:"omitempty,min=0,max=100"`
	AliquotaIPI        *float64 `json:"aliquota_ipi" binding:"omitempty,min=0,max=100"`
	AliquotaPIS        *float64 `json:"aliquota_pis" binding:"omitempty,min=0,max=100"`
	AliquotaCOFINS     *float64 `json:"aliquota_cofins" binding:"omitempty,min=0,max=100"`
	CSTICMS            *string  `json:"cst_icms" binding:"omitempty,len=3"`
	CSTIPI             *string  `json:"cst_ipi" binding:"omitempty,len=2"`
	CSTPIS             *string  `json:"cst_pis" binding:"omitempty,len=2"`
	CSTCOFINS          *string  `json:"cst_cofins" binding:"omitempty,len=2"`
	CSOSN              *string  `json:"csosn" binding:"omitempty,len=3"`
	CalculaICMS        *bool    `json:"calcula_icms"`
	CalculaIPI         *bool    `json:"calcula_ipi"`
	CalculaPIS         *bool    `json:"calcula_pis"`
	CalculaCOFINS      *bool    `json:"calcula_cofins"`
	SubstituicaoTrib   *bool    `json:"substituicao_trib"`
	MVA                *float64 `json:"mva" binding:"omitempty,min=0"`
	AliquotaST         *float64 `json:"aliquota_st" binding:"omitempty,min=0,max=100"`
	InformacoesAdic    *string  `json:"informacoes_adicionais"`
	ObservacoesFiscais *string  `json:"observacoes_fiscais"`
}

type UpdateEstoqueRequest struct {
	Quantidade int    `json:"quantidade" binding:"required"`
	Operacao   string `json:"operacao" binding:"required"` // adicionar, remover, ajustar
}

// ============================================
// DTOs ESPECÍFICOS PARA DADOS FISCAIS
// ============================================

type UpdateDadosFiscaisRequest struct {
	NCM                string  `json:"ncm" binding:"omitempty,len=8"`
	CEST               string  `json:"cest" binding:"omitempty,len=7"`
	UnidadeTributavel  string  `json:"unidade_tributavel"`
	OrigemProduto      int     `json:"origem_produto" binding:"min=0,max=8"`
	AliquotaICMS       float64 `json:"aliquota_icms" binding:"min=0,max=100"`
	AliquotaIPI        float64 `json:"aliquota_ipi" binding:"min=0,max=100"`
	AliquotaPIS        float64 `json:"aliquota_pis" binding:"min=0,max=100"`
	AliquotaCOFINS     float64 `json:"aliquota_cofins" binding:"min=0,max=100"`
	CSTICMS            string  `json:"cst_icms" binding:"omitempty,len=3"`
	CSTIPI             string  `json:"cst_ipi" binding:"omitempty,len=2"`
	CSTPIS             string  `json:"cst_pis" binding:"omitempty,len=2"`
	CSTCOFINS          string  `json:"cst_cofins" binding:"omitempty,len=2"`
	CSOSN              string  `json:"csosn" binding:"omitempty,len=3"`
	CalculaICMS        bool    `json:"calcula_icms"`
	CalculaIPI         bool    `json:"calcula_ipi"`
	CalculaPIS         bool    `json:"calcula_pis"`
	CalculaCOFINS      bool    `json:"calcula_cofins"`
	SubstituicaoTrib   bool    `json:"substituicao_trib"`
	MVA                float64 `json:"mva" binding:"min=0"`
	AliquotaST         float64 `json:"aliquota_st" binding:"min=0,max=100"`
	InformacoesAdic    string  `json:"informacoes_adicionais"`
	ObservacoesFiscais string  `json:"observacoes_fiscais"`
}

type CalcularImpostosRequest struct {
	ProdutoID uint    `json:"produto_id" binding:"required"`
	Preco     float64 `json:"preco" binding:"required,min=0"`
}

type CalcularImpostosResponse struct {
	ProdutoID    uint               `json:"produto_id"`
	Preco        float64            `json:"preco"`
	Impostos     map[string]float64 `json:"impostos"`
	TotalImpostos float64           `json:"total_impostos"`
	PrecoFinal   float64            `json:"preco_final"`
}

type ValidarDadosFiscaisResponse struct {
	ProdutoID uint     `json:"produto_id"`
	Valido    bool     `json:"valido"`
	Erros     []string `json:"erros,omitempty"`
}

type BuscarProdutoFiscalRequest struct {
	NCM       string `json:"ncm" binding:"omitempty,len=8"`
	CEST      string `json:"cest" binding:"omitempty,len=7"`
	CSTICMS   string `json:"cst_icms" binding:"omitempty,len=3"`
	CSOSN     string `json:"csosn" binding:"omitempty,len=3"`
	ComST     *bool  `json:"com_st"` // true, false ou nil para ambos
	Limit     int    `json:"limit" binding:"omitempty,min=1,max=100"`
}

// ============================================
// RESPONSES PARA RELATÓRIOS FISCAIS
// ============================================

type ProdutoFiscalResumo struct {
	ID                 uint    `json:"id"`
	Nome               string  `json:"nome"`
	Codigo             string  `json:"codigo"`
	NCM                string  `json:"ncm"`
	CEST               string  `json:"cest"`
	OrigemProduto      int     `json:"origem_produto"`
	DescricaoOrigem    string  `json:"descricao_origem"`
	CSTICMS            string  `json:"cst_icms"`
	CSOSN              string  `json:"csosn"`
	AliquotaICMS       float64 `json:"aliquota_icms"`
	SubstituicaoTrib   bool    `json:"substituicao_trib"`
	DadosFiscaisOK     bool    `json:"dados_fiscais_ok"`
	ErrosFiscais       []string `json:"erros_fiscais,omitempty"`
}

type RelatorioFiscalResponse struct {
	TotalProdutos           int                   `json:"total_produtos"`
	ProdutosComNCM          int                   `json:"produtos_com_ncm"`
	ProdutosSemNCM          int                   `json:"produtos_sem_ncm"`
	ProdutosComST           int                   `json:"produtos_com_st"`
	ProdutosComErrosFiscais int                   `json:"produtos_com_erros_fiscais"`
	Produtos                []ProdutoFiscalResumo `json:"produtos"`
}

