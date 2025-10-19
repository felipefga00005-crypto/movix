package repositories

import (
	"time"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// CertificateRepository handles certificate data access
type CertificateRepository struct {
	db *gorm.DB
}

// NewCertificateRepository creates a new certificate repository
func NewCertificateRepository(db *gorm.DB) *CertificateRepository {
	return &CertificateRepository{db: db}
}

// GetDB returns the database instance
func (r *CertificateRepository) GetDB() *gorm.DB {
	return r.db
}

// Create creates a new certificate
func (r *CertificateRepository) Create(certificate *models.Certificate) error {
	return r.db.Create(certificate).Error
}

// FindByID finds a certificate by ID
func (r *CertificateRepository) FindByID(id uuid.UUID) (*models.Certificate, error) {
	var certificate models.Certificate
	err := r.db.Where("id = ?", id).First(&certificate).Error
	if err != nil {
		return nil, err
	}
	return &certificate, nil
}

// FindByCompany finds all certificates for a company
func (r *CertificateRepository) FindByCompany(companyID uuid.UUID) ([]models.Certificate, error) {
	var certificates []models.Certificate
	err := r.db.Where("company_id = ?", companyID).
		Order("created_at DESC").
		Find(&certificates).Error
	return certificates, err
}

// FindActiveByCompany finds the active certificate for a company
func (r *CertificateRepository) FindActiveByCompany(companyID uuid.UUID) (*models.Certificate, error) {
	var certificate models.Certificate
	err := r.db.Where("company_id = ? AND status = ?", companyID, models.CertificateStatusActive).
		Order("created_at DESC").
		First(&certificate).Error
	if err != nil {
		return nil, err
	}
	return &certificate, nil
}

// Update updates a certificate
func (r *CertificateRepository) Update(certificate *models.Certificate) error {
	return r.db.Save(certificate).Error
}

// UpdateStatus updates certificate status
func (r *CertificateRepository) UpdateStatus(id uuid.UUID, status models.CertificateStatus) error {
	return r.db.Model(&models.Certificate{}).
		Where("id = ?", id).
		Update("status", status).Error
}

// Delete soft deletes a certificate
func (r *CertificateRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Certificate{}, id).Error
}

// DeactivateAllByCompany deactivates all certificates for a company
func (r *CertificateRepository) DeactivateAllByCompany(companyID uuid.UUID) error {
	return r.db.Model(&models.Certificate{}).
		Where("company_id = ? AND status = ?", companyID, models.CertificateStatusActive).
		Update("status", models.CertificateStatusInactive).Error
}

// FindExpiringCertificates finds certificates expiring within the specified days
func (r *CertificateRepository) FindExpiringCertificates(days int) ([]models.Certificate, error) {
	var certificates []models.Certificate
	expirationDate := time.Now().AddDate(0, 0, days)
	
	err := r.db.Where("status = ? AND expires_at <= ? AND expires_at > ?",
		models.CertificateStatusActive, expirationDate, time.Now()).
		Preload("Company").
		Find(&certificates).Error
	
	return certificates, err
}

// FindExpiredCertificates finds all expired certificates that are still active
func (r *CertificateRepository) FindExpiredCertificates() ([]models.Certificate, error) {
	var certificates []models.Certificate
	
	err := r.db.Where("status = ? AND expires_at < ?",
		models.CertificateStatusActive, time.Now()).
		Preload("Company").
		Find(&certificates).Error
	
	return certificates, err
}

// MarkExpiredCertificates marks all expired certificates as expired
func (r *CertificateRepository) MarkExpiredCertificates() (int64, error) {
	result := r.db.Model(&models.Certificate{}).
		Where("status = ? AND expires_at < ?", models.CertificateStatusActive, time.Now()).
		Update("status", models.CertificateStatusExpired)
	
	return result.RowsAffected, result.Error
}

// CountByCompany counts certificates by company
func (r *CertificateRepository) CountByCompany(companyID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.Certificate{}).Where("company_id = ?", companyID).Count(&count).Error
	return count, err
}

// CountActiveByCompany counts active certificates by company
func (r *CertificateRepository) CountActiveByCompany(companyID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.Certificate{}).
		Where("company_id = ? AND status = ?", companyID, models.CertificateStatusActive).
		Count(&count).Error
	return count, err
}

// IsExpired checks if a certificate is expired
func (r *CertificateRepository) IsExpired(id uuid.UUID) (bool, error) {
	var certificate models.Certificate
	err := r.db.Select("expires_at").Where("id = ?", id).First(&certificate).Error
	if err != nil {
		return false, err
	}
	return certificate.ExpiresAt.Before(time.Now()), nil
}

// GetDaysUntilExpiration gets the number of days until a certificate expires
func (r *CertificateRepository) GetDaysUntilExpiration(id uuid.UUID) (int, error) {
	var certificate models.Certificate
	err := r.db.Select("expires_at").Where("id = ?", id).First(&certificate).Error
	if err != nil {
		return 0, err
	}
	
	duration := time.Until(certificate.ExpiresAt)
	days := int(duration.Hours() / 24)
	
	return days, nil
}

