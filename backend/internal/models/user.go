package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID             uint           `gorm:"primaryKey;column:id" json:"id"`
	Codigo         string         `gorm:"uniqueIndex;size:50;column:codigo" json:"codigo"`
	Nome           string         `gorm:"size:200;not null;column:nome" json:"nome"`
	Email          string         `gorm:"uniqueIndex;size:200;not null;column:email" json:"email"`
	Senha          string         `gorm:"size:255;not null;column:senha" json:"-"` // Não retorna no JSON
	Telefone       string         `gorm:"size:20;column:telefone" json:"telefone"`
	Cargo          string         `gorm:"size:100;column:cargo" json:"cargo"`
	Departamento   string         `gorm:"size:100;column:departamento" json:"departamento"`
	Perfil         string         `gorm:"size:50;default:'operador';column:perfil" json:"perfil"` // admin, gerente, vendedor, etc
	Status         string         `gorm:"size:20;default:'Ativo';column:status" json:"status"`    // Ativo, Inativo, Pendente
	Avatar         string         `gorm:"size:500;column:avatar" json:"avatar"`
	UltimoAcesso   *time.Time     `gorm:"column:ultimo_acesso" json:"ultimo_acesso"`
	DataCadastro   time.Time      `gorm:"autoCreateTime;column:data_cadastro" json:"data_cadastro"`
	DataAtualizacao time.Time     `gorm:"autoUpdateTime;column:data_atualizacao" json:"data_atualizacao"`
	DeletedAt      gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}

// TableName especifica o nome da tabela
func (User) TableName() string {
	return "usuarios"
}

// BeforeCreate hook do GORM - executa antes de criar
func (u *User) BeforeCreate(tx *gorm.DB) error {
	// Gera código automático se não fornecido
	if u.Codigo == "" {
		u.Codigo = generateUserCode()
	}
	
	// Hash da senha
	if u.Senha != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Senha), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Senha = string(hashedPassword)
	}
	
	return nil
}

// BeforeUpdate hook do GORM - executa antes de atualizar
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	// Se a senha foi alterada, faz o hash
	if tx.Statement.Changed("Senha") && u.Senha != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Senha), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Senha = string(hashedPassword)
	}
	
	return nil
}

// CheckPassword verifica se a senha está correta
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Senha), []byte(password))
	return err == nil
}

// generateUserCode gera um código único para o usuário
func generateUserCode() string {
	// Formato: USR + timestamp
	return "USR" + time.Now().Format("20060102150405")
}

// CreateUserRequest DTO para criação de usuário
type CreateUserRequest struct {
	Nome         string `json:"nome" binding:"required"`
	Email        string `json:"email" binding:"required,email"`
	Senha        string `json:"senha" binding:"required,min=6"`
	Telefone     string `json:"telefone"`
	Cargo        string `json:"cargo"`
	Departamento string `json:"departamento"`
	Perfil       string `json:"perfil"`
	Status       string `json:"status"`
}

// UpdateUserRequest DTO para atualização de usuário
type UpdateUserRequest struct {
	Nome         string `json:"nome"`
	Email        string `json:"email"`
	Telefone     string `json:"telefone"`
	Cargo        string `json:"cargo"`
	Departamento string `json:"departamento"`
	Perfil       string `json:"perfil"`
	Status       string `json:"status"`
	Avatar       string `json:"avatar"`
}

// ChangePasswordRequest DTO para alteração de senha
type ChangePasswordRequest struct {
	SenhaAtual string `json:"senhaAtual" binding:"required"`
	SenhaNova  string `json:"senhaNova" binding:"required,min=6"`
}

// LoginRequest DTO para login
type LoginRequest struct {
	Email string `json:"email" binding:"required,email"`
	Senha string `json:"senha" binding:"required"`
}

// LoginResponse DTO para resposta de login
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

