package models

import (
	"time"

	"gorm.io/gorm"
)

type Fornecedor struct {
	ID              uint           `gorm:"primaryKey;column:id" json:"id"`
	Codigo          string         `gorm:"uniqueIndex;size:50;column:codigo" json:"codigo"`
	RazaoSocial     string         `gorm:"size:200;not null;column:razao_social" json:"razao_social"`
	NomeFantasia    string         `gorm:"size:200;column:nome_fantasia" json:"nome_fantasia"`
	CNPJ            string         `gorm:"uniqueIndex;size:18;not null;column:cnpj" json:"cnpj"`
	Email           string         `gorm:"size:200;column:email" json:"email"`
	Telefone        string         `gorm:"size:20;column:telefone" json:"telefone"`
	Endereco        string         `gorm:"size:300;column:endereco" json:"endereco"`
	Cidade          string         `gorm:"size:100;column:cidade" json:"cidade"`
	UF              string         `gorm:"size:2;column:uf" json:"uf"`
	CEP             string         `gorm:"size:10;column:cep" json:"cep"`
	Status          string         `gorm:"size:20;default:'Ativo';column:status" json:"status"` // Ativo, Inativo, Pendente
	Categoria       string         `gorm:"size:100;column:categoria" json:"categoria"`             // Distribuidor, Fabricante, etc
	Contato         string         `gorm:"size:200;column:contato" json:"contato"`
	DataCadastro    time.Time      `gorm:"autoCreateTime;column:data_cadastro" json:"data_cadastro"`
	DataAtualizacao time.Time      `gorm:"autoUpdateTime;column:data_atualizacao" json:"data_atualizacao"`
	DeletedAt       gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}

func (Fornecedor) TableName() string {
	return "fornecedores"
}

// BeforeCreate hook do GORM
func (f *Fornecedor) BeforeCreate(tx *gorm.DB) error {
	// Gera código automático se não fornecido
	if f.Codigo == "" {
		f.Codigo = generateFornecedorCode()
	}
	
	// Define valores padrão
	if f.Status == "" {
		f.Status = "Ativo"
	}
	
	return nil
}

func generateFornecedorCode() string {
	return "FOR" + time.Now().Format("20060102150405")
}

// DTOs
type CreateFornecedorRequest struct {
	RazaoSocial  string `json:"razaoSocial" binding:"required"`
	NomeFantasia string `json:"nomeFantasia"`
	CNPJ         string `json:"cnpj" binding:"required"`
	Email        string `json:"email"`
	Telefone     string `json:"telefone"`
	Endereco     string `json:"endereco"`
	Cidade       string `json:"cidade"`
	UF           string `json:"uf"`
	CEP          string `json:"cep"`
	Status       string `json:"status"`
	Categoria    string `json:"categoria"`
	Contato      string `json:"contato"`
}

type UpdateFornecedorRequest struct {
	RazaoSocial  string `json:"razaoSocial"`
	NomeFantasia string `json:"nomeFantasia"`
	Email        string `json:"email"`
	Telefone     string `json:"telefone"`
	Endereco     string `json:"endereco"`
	Cidade       string `json:"cidade"`
	UF           string `json:"uf"`
	CEP          string `json:"cep"`
	Status       string `json:"status"`
	Categoria    string `json:"categoria"`
	Contato      string `json:"contato"`
}

