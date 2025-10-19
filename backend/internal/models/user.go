package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserRole represents the role of a user
type UserRole string

const (
	RoleSuperAdmin UserRole = "superadmin"
	RoleAdmin      UserRole = "admin"
	RoleUser       UserRole = "user"
)

// UserStatus represents the status of a user
type UserStatus string

const (
	UserStatusActive    UserStatus = "active"
	UserStatusInactive  UserStatus = "inactive"
	UserStatusSuspended UserStatus = "suspended"
)

// User represents a user in the system
type User struct {
	ID        uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AccountID *uuid.UUID `gorm:"type:uuid;index" json:"account_id"` // NULL for superadmin
	Email     string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password  string     `gorm:"type:varchar(255);not null" json:"-"` // Never return password in JSON
	Name      string     `gorm:"type:varchar(255);not null" json:"name"`
	Phone     string     `gorm:"type:varchar(20)" json:"phone"`
	Role      UserRole   `gorm:"type:varchar(20);not null;default:'user'" json:"role"`
	Status    UserStatus `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Account       *Account      `gorm:"foreignKey:AccountID;constraint:OnDelete:CASCADE" json:"account,omitempty"`
	UserCompanies []UserCompany `gorm:"foreignKey:UserID" json:"user_companies,omitempty"`
	NFes          []NFe         `gorm:"foreignKey:UserID" json:"nfes,omitempty"`
}

// TableName specifies the table name for User model
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to set default values
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	if u.Role == "" {
		u.Role = RoleUser
	}
	if u.Status == "" {
		u.Status = UserStatusActive
	}
	return nil
}

// IsSuperAdmin checks if user is a superadmin
func (u *User) IsSuperAdmin() bool {
	return u.Role == RoleSuperAdmin
}

// IsAdmin checks if user is an admin
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

// IsUser checks if user is a regular user
func (u *User) IsUser() bool {
	return u.Role == RoleUser
}

// IsActive checks if user is active
func (u *User) IsActive() bool {
	return u.Status == UserStatusActive
}

// HasRole checks if user has a specific role
func (u *User) HasRole(role UserRole) bool {
	return u.Role == role
}

// HasAnyRole checks if user has any of the specified roles
func (u *User) HasAnyRole(roles ...UserRole) bool {
	for _, role := range roles {
		if u.Role == role {
			return true
		}
	}
	return false
}

