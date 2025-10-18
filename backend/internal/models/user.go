package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleSuperAdmin UserRole = "super_admin"
	RoleAdmin      UserRole = "admin"
	RoleUser       UserRole = "user"
)

// SuperAdmin model
type SuperAdmin struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Nome         string    `gorm:"not null" json:"nome"`
	Ativo        bool      `gorm:"default:true" json:"ativo"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Empresa (Company) model
type Empresa struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Nome         string    `gorm:"not null" json:"nome"`
	RazaoSocial  string    `json:"razao_social"`
	Plano        string    `gorm:"default:'basic'" json:"plano"`
	Status       string    `gorm:"default:'active'" json:"status"`
	Ativo        bool      `gorm:"default:true" json:"ativo"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Usuario (Internal User) model
type Usuario struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	EmpresaID    uuid.UUID `gorm:"type:uuid;not null" json:"empresa_id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Nome         string    `gorm:"not null" json:"nome"`
	Role         UserRole  `gorm:"default:'user'" json:"role"`
	Ativo        bool      `gorm:"default:true" json:"ativo"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Empresa *Empresa `gorm:"foreignKey:EmpresaID" json:"empresa,omitempty"`
}

// CNPJ model
type CNPJ struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	EmpresaID    uuid.UUID `gorm:"type:uuid;not null" json:"empresa_id"`
	CNPJ         string    `gorm:"uniqueIndex;size:14;not null" json:"cnpj"`
	RazaoSocial  string    `json:"razao_social"`
	NomeFantasia string    `json:"nome_fantasia"`
	Autorizado   bool      `gorm:"default:false" json:"autorizado"`
	Ativo        bool      `gorm:"default:true" json:"ativo"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Empresa *Empresa `gorm:"foreignKey:EmpresaID" json:"empresa,omitempty"`
}

// Modulo (Module) model
type Modulo struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Nome      string    `gorm:"uniqueIndex;size:100;not null" json:"nome"`
	Descricao string    `json:"descricao"`
	Slug      string    `gorm:"uniqueIndex;size:100;not null" json:"slug"`
	Ativo     bool      `gorm:"default:true" json:"ativo"`
	CreatedAt time.Time `json:"created_at"`
}

// EmpresaModulo (Company Module) model
type EmpresaModulo struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	EmpresaID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_empresa_modulo" json:"empresa_id"`
	ModuloID  uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_empresa_modulo" json:"modulo_id"`
	Ativo     bool      `gorm:"default:true" json:"ativo"`
	CreatedAt time.Time `json:"created_at"`

	Empresa *Empresa `gorm:"foreignKey:EmpresaID" json:"empresa,omitempty"`
	Modulo  *Modulo  `gorm:"foreignKey:ModuloID" json:"modulo,omitempty"`
}

// UsuarioModulo (User Module) model
type UsuarioModulo struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UsuarioID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_usuario_modulo" json:"usuario_id"`
	ModuloID  uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_usuario_modulo" json:"modulo_id"`
	Ativo     bool      `gorm:"default:true" json:"ativo"`
	CreatedAt time.Time `json:"created_at"`

	Usuario *Usuario `gorm:"foreignKey:UsuarioID" json:"usuario,omitempty"`
	Modulo  *Modulo  `gorm:"foreignKey:ModuloID" json:"modulo,omitempty"`
}

// PasswordReset model for password recovery
type PasswordReset struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email     string    `gorm:"not null;index" json:"email"`
	Token     string    `gorm:"uniqueIndex;not null" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	Used      bool      `gorm:"default:false" json:"used"`
	CreatedAt time.Time `json:"created_at"`
}

// UserInvite model for first access setup
type UserInvite struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email     string    `gorm:"not null;index" json:"email"`
	Token     string    `gorm:"uniqueIndex;not null" json:"token"`
	Role      UserRole  `gorm:"not null" json:"role"`
	EmpresaID *uuid.UUID `gorm:"type:uuid" json:"empresa_id,omitempty"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	Used      bool      `gorm:"default:false" json:"used"`
	CreatedAt time.Time `json:"created_at"`
}

// BeforeCreate hooks to generate UUIDs
func (s *SuperAdmin) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

func (e *Empresa) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	return nil
}

func (u *Usuario) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

func (c *CNPJ) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

func (m *Modulo) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

func (em *EmpresaModulo) BeforeCreate(tx *gorm.DB) error {
	if em.ID == uuid.Nil {
		em.ID = uuid.New()
	}
	return nil
}

func (um *UsuarioModulo) BeforeCreate(tx *gorm.DB) error {
	if um.ID == uuid.Nil {
		um.ID = uuid.New()
	}
	return nil
}

func (pr *PasswordReset) BeforeCreate(tx *gorm.DB) error {
	if pr.ID == uuid.Nil {
		pr.ID = uuid.New()
	}
	return nil
}

func (ui *UserInvite) BeforeCreate(tx *gorm.DB) error {
	if ui.ID == uuid.Nil {
		ui.ID = uuid.New()
	}
	return nil
}

