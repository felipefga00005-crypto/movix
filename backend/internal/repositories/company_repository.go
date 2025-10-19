package repositories

import (
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// CompanyRepository handles company data access
type CompanyRepository struct {
	db *gorm.DB
}

// NewCompanyRepository creates a new company repository
func NewCompanyRepository(db *gorm.DB) *CompanyRepository {
	return &CompanyRepository{db: db}
}

// Create creates a new company
func (r *CompanyRepository) Create(company *models.Company) error {
	return r.db.Create(company).Error
}

// FindByID finds a company by ID
func (r *CompanyRepository) FindByID(id uuid.UUID) (*models.Company, error) {
	var company models.Company
	err := r.db.Where("id = ?", id).First(&company).Error
	if err != nil {
		return nil, err
	}
	return &company, nil
}

// FindByIDWithCertificate finds a company by ID and preloads certificate
func (r *CompanyRepository) FindByIDWithCertificate(id uuid.UUID) (*models.Company, error) {
	var company models.Company
	err := r.db.Preload("Certificate").Where("id = ?", id).First(&company).Error
	if err != nil {
		return nil, err
	}
	return &company, nil
}

// FindByDocument finds a company by document (CNPJ)
func (r *CompanyRepository) FindByDocument(document string) (*models.Company, error) {
	var company models.Company
	err := r.db.Where("document = ?", document).First(&company).Error
	if err != nil {
		return nil, err
	}
	return &company, nil
}

// FindByAccountAndDocument finds a company by account and document
func (r *CompanyRepository) FindByAccountAndDocument(accountID uuid.UUID, document string) (*models.Company, error) {
	var company models.Company
	err := r.db.Where("account_id = ? AND document = ?", accountID, document).First(&company).Error
	if err != nil {
		return nil, err
	}
	return &company, nil
}

// Update updates a company
func (r *CompanyRepository) Update(company *models.Company) error {
	return r.db.Save(company).Error
}

// Delete soft deletes a company
func (r *CompanyRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Company{}, id).Error
}

// ListByAccount lists companies by account with pagination
func (r *CompanyRepository) ListByAccount(accountID uuid.UUID, status *models.CompanyStatus, page, perPage int) ([]models.Company, int64, error) {
	var companies []models.Company
	var total int64

	query := r.db.Model(&models.Company{}).Where("account_id = ?", accountID)

	// Filter by status if provided
	if status != nil {
		query = query.Where("status = ?", *status)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * perPage
	err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&companies).Error
	if err != nil {
		return nil, 0, err
	}

	return companies, total, nil
}

// CountByAccount counts companies by account
func (r *CompanyRepository) CountByAccount(accountID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.Company{}).Where("account_id = ?", accountID).Count(&count).Error
	return count, err
}

// CountByAccountAndStatus counts companies by account and status
func (r *CompanyRepository) CountByAccountAndStatus(accountID uuid.UUID, status models.CompanyStatus) (int64, error) {
	var count int64
	err := r.db.Model(&models.Company{}).
		Where("account_id = ? AND status = ?", accountID, status).
		Count(&count).Error
	return count, err
}

// UpdateStatus updates company status
func (r *CompanyRepository) UpdateStatus(id uuid.UUID, status models.CompanyStatus) error {
	return r.db.Model(&models.Company{}).
		Where("id = ?", id).
		Update("status", status).Error
}

// UpdateCertificate updates company certificate
func (r *CompanyRepository) UpdateCertificate(id uuid.UUID, certificateID *uuid.UUID) error {
	return r.db.Model(&models.Company{}).
		Where("id = ?", id).
		Update("certificate_id", certificateID).Error
}

// IncrementNFeNumber increments the next NFe number for a company
func (r *CompanyRepository) IncrementNFeNumber(id uuid.UUID) (int, error) {
	var company models.Company

	// Use transaction to ensure atomicity
	err := r.db.Transaction(func(tx *gorm.DB) error {
		// Lock the row for update
		if err := tx.Raw("SELECT * FROM companies WHERE id = ? FOR UPDATE", id).
			Scan(&company).Error; err != nil {
			return err
		}

		// Increment the number
		company.NextNFeNumber++

		// Save the updated company
		if err := tx.Save(&company).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return 0, err
	}

	return company.NextNFeNumber - 1, nil
}

// UpdateEnvironment updates company environment (homologation/production)
func (r *CompanyRepository) UpdateEnvironment(id uuid.UUID, environment models.Environment) error {
	return r.db.Model(&models.Company{}).
		Where("id = ?", id).
		Update("environment", environment).Error
}

