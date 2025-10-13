package models

import (
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
	PrecoCusto      float64        `gorm:"type:decimal(10,2);column:precoCusto" json:"precoCusto"`
	Estoque         int            `gorm:"default:0;column:estoque" json:"estoque"`
	EstoqueMinimo   int            `gorm:"default:10;column:estoqueMinimo" json:"estoqueMinimo"`
	Unidade         string         `gorm:"size:20;default:'UN';column:unidade" json:"unidade"` // UN, KG, L, M, etc
	Status          string         `gorm:"size:20;default:'Ativo';column:status" json:"status"`
	Fornecedor      string         `gorm:"size:200;column:fornecedor" json:"fornecedor"`
	Descricao       string         `gorm:"type:text;column:descricao" json:"descricao"`
	Peso            string         `gorm:"size:50;column:peso" json:"peso"`
	Dimensoes       string         `gorm:"size:100;column:dimensoes" json:"dimensoes"`
	Garantia        string         `gorm:"size:50;column:garantia" json:"garantia"`
	DataCadastro    time.Time      `gorm:"autoCreateTime;column:dataCadastro" json:"dataCadastro"`
	DataUltimaVenda string         `gorm:"size:50;column:dataUltimaVenda" json:"dataUltimaVenda"`
	DataAtualizacao time.Time      `gorm:"autoUpdateTime;column:dataAtualizacao" json:"dataAtualizacao"`
	DeletedAt       gorm.DeletedAt `gorm:"index;column:deletedAt" json:"-"`
}

func (Produto) TableName() string {
	return "produtos"
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

// DTOs
type CreateProdutoRequest struct {
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
	Descricao     string  `json:"descricao"`
	Peso          string  `json:"peso"`
	Dimensoes     string  `json:"dimensoes"`
	Garantia      string  `json:"garantia"`
}

type UpdateProdutoRequest struct {
	Nome          string  `json:"nome"`
	Categoria     string  `json:"categoria"`
	Subcategoria  string  `json:"subcategoria"`
	Marca         string  `json:"marca"`
	Modelo        string  `json:"modelo"`
	Preco         float64 `json:"preco"`
	PrecoCusto    float64 `json:"precoCusto"`
	Estoque       int     `json:"estoque"`
	EstoqueMinimo int     `json:"estoqueMinimo"`
	Unidade       string  `json:"unidade"`
	Status        string  `json:"status"`
	Fornecedor    string  `json:"fornecedor"`
	Descricao     string  `json:"descricao"`
	Peso          string  `json:"peso"`
	Dimensoes     string  `json:"dimensoes"`
	Garantia      string  `json:"garantia"`
}

type UpdateEstoqueRequest struct {
	Quantidade int    `json:"quantidade" binding:"required"`
	Operacao   string `json:"operacao" binding:"required"` // adicionar, remover, ajustar
}

