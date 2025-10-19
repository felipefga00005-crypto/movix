package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AccountStatus represents the status of an account
type AccountStatus string

const (
	AccountStatusActive    AccountStatus = "active"
	AccountStatusSuspended AccountStatus = "suspended"
	AccountStatusCancelled AccountStatus = "cancelled"
)

// Account represents an accounting office (escritório de contabilidade)
type Account struct {
	ID                uuid.UUID     `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name              string        `gorm:"type:varchar(255);not null" json:"name"`
	Email             string        `gorm:"type:varchar(255);not null" json:"email"`
	Phone             string        `gorm:"type:varchar(20)" json:"phone"`
	Document          string        `gorm:"type:varchar(18);uniqueIndex;not null" json:"document"` // CNPJ
	MaxCompanies      int           `gorm:"not null;default:10" json:"max_companies"`
	MaxUsers          int           `gorm:"not null;default:50" json:"max_users"`
	MaxNFesPerMonth   int           `gorm:"column:max_nfes_per_month;not null;default:1000" json:"max_nfes_per_month"`
	Status            AccountStatus `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt         time.Time     `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time     `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Users     []User    `gorm:"foreignKey:AccountID" json:"users,omitempty"`
	Companies []Company `gorm:"foreignKey:AccountID" json:"companies,omitempty"`
}

// TableName specifies the table name for Account model
func (Account) TableName() string {
	return "accounts"
}

// BeforeCreate hook to set default values
func (a *Account) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	if a.Status == "" {
		a.Status = AccountStatusActive
	}
	if a.MaxCompanies == 0 {
		a.MaxCompanies = 10
	}
	if a.MaxUsers == 0 {
		a.MaxUsers = 50
	}
	if a.MaxNFesPerMonth == 0 {
		a.MaxNFesPerMonth = 1000
	}
	return nil
}

// IsActive checks if account is active
func (a *Account) IsActive() bool {
	return a.Status == AccountStatusActive
}

// IsSuspended checks if account is suspended
func (a *Account) IsSuspended() bool {
	return a.Status == AccountStatusSuspended
}

// IsCancelled checks if account is cancelled
func (a *Account) IsCancelled() bool {
	return a.Status == AccountStatusCancelled
}

// CanCreateCompany checks if account can create more companies
func (a *Account) CanCreateCompany(currentCount int) bool {
	return currentCount < a.MaxCompanies
}

// CanCreateUser checks if account can create more users
func (a *Account) CanCreateUser(currentCount int) bool {
	return currentCount < a.MaxUsers
}

// CanCreateNFe checks if account can create more NFes this month
func (a *Account) CanCreateNFe(currentMonthCount int) bool {
	return currentMonthCount < a.MaxNFesPerMonth
}

