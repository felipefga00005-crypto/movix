package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserCompanyRole represents the role of a user in a company
type UserCompanyRole string

const (
	UserCompanyRoleOwner    UserCompanyRole = "owner"
	UserCompanyRoleManager  UserCompanyRole = "manager"
	UserCompanyRoleOperator UserCompanyRole = "operator"
)

// UserCompany represents the relationship between users and companies (pivot table)
type UserCompany struct {
	ID        uuid.UUID       `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID       `gorm:"type:uuid;not null;index" json:"user_id"`
	CompanyID uuid.UUID       `gorm:"type:uuid;not null;index" json:"company_id"`
	Role      UserCompanyRole `gorm:"type:varchar(20);not null;default:'operator'" json:"role"`
	CreatedAt time.Time       `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time       `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	User    *User    `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Company *Company `gorm:"foreignKey:CompanyID;constraint:OnDelete:CASCADE" json:"company,omitempty"`
}

// TableName specifies the table name for UserCompany model
func (UserCompany) TableName() string {
	return "user_companies"
}

// BeforeCreate hook to set default values
func (uc *UserCompany) BeforeCreate(tx *gorm.DB) error {
	if uc.ID == uuid.Nil {
		uc.ID = uuid.New()
	}
	if uc.Role == "" {
		uc.Role = UserCompanyRoleOperator
	}
	return nil
}

// IsOwner checks if user is owner of the company
func (uc *UserCompany) IsOwner() bool {
	return uc.Role == UserCompanyRoleOwner
}

// IsManager checks if user is manager of the company
func (uc *UserCompany) IsManager() bool {
	return uc.Role == UserCompanyRoleManager
}

// IsOperator checks if user is operator of the company
func (uc *UserCompany) IsOperator() bool {
	return uc.Role == UserCompanyRoleOperator
}

// HasRole checks if user has a specific role in the company
func (uc *UserCompany) HasRole(role UserCompanyRole) bool {
	return uc.Role == role
}

// CanManage checks if user can manage the company (owner or manager)
func (uc *UserCompany) CanManage() bool {
	return uc.Role == UserCompanyRoleOwner || uc.Role == UserCompanyRoleManager
}

