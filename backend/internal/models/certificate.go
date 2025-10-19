package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CertificateStatus represents the status of a certificate
type CertificateStatus string

const (
	CertificateStatusActive   CertificateStatus = "active"
	CertificateStatusInactive CertificateStatus = "inactive"
	CertificateStatusExpired  CertificateStatus = "expired"
)

// Certificate represents a digital certificate (A1) for NFe signing
type Certificate struct {
	ID        uuid.UUID         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CompanyID uuid.UUID         `gorm:"type:uuid;not null;index" json:"company_id"`
	Name      string            `gorm:"type:varchar(255);not null" json:"name"`
	Content   []byte            `gorm:"type:bytea;not null" json:"-"`         // Encrypted certificate content (.pfx)
	Password  string            `gorm:"type:varchar(255);not null" json:"-"`  // Encrypted password
	ExpiresAt time.Time         `gorm:"not null;index" json:"expires_at"`
	Status    CertificateStatus `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt time.Time         `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time         `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt    `gorm:"index" json:"-"`

	// Relationships
	Company *Company `gorm:"foreignKey:CompanyID;constraint:OnDelete:CASCADE" json:"company,omitempty"`
}

// TableName specifies the table name for Certificate model
func (Certificate) TableName() string {
	return "certificates"
}

// BeforeCreate hook to set default values
func (c *Certificate) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	if c.Status == "" {
		c.Status = CertificateStatusActive
	}
	return nil
}

// IsActive checks if certificate is active
func (c *Certificate) IsActive() bool {
	return c.Status == CertificateStatusActive
}

// IsExpired checks if certificate is expired
func (c *Certificate) IsExpired() bool {
	return c.Status == CertificateStatusExpired || time.Now().After(c.ExpiresAt)
}

// IsValid checks if certificate is valid (active and not expired)
func (c *Certificate) IsValid() bool {
	return c.IsActive() && !c.IsExpired()
}

// DaysUntilExpiration returns the number of days until the certificate expires
func (c *Certificate) DaysUntilExpiration() int {
	duration := time.Until(c.ExpiresAt)
	return int(duration.Hours() / 24)
}

// IsExpiringSoon checks if certificate is expiring within the specified days
func (c *Certificate) IsExpiringSoon(days int) bool {
	daysUntilExpiration := c.DaysUntilExpiration()
	return daysUntilExpiration > 0 && daysUntilExpiration <= days
}

// UpdateStatus updates the certificate status based on expiration date
func (c *Certificate) UpdateStatus(tx *gorm.DB) error {
	if c.IsExpired() && c.Status != CertificateStatusExpired {
		c.Status = CertificateStatusExpired
		return tx.Model(c).Update("status", CertificateStatusExpired).Error
	}
	return nil
}

