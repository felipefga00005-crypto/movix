package repositories

import (
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// AccountRepository handles account data access
type AccountRepository struct {
	db *gorm.DB
}

// NewAccountRepository creates a new account repository
func NewAccountRepository(db *gorm.DB) *AccountRepository {
	return &AccountRepository{db: db}
}

// Create creates a new account
func (r *AccountRepository) Create(account *models.Account) error {
	return r.db.Create(account).Error
}

// FindByID finds an account by ID
func (r *AccountRepository) FindByID(id uuid.UUID) (*models.Account, error) {
	var account models.Account
	err := r.db.Where("id = ?", id).First(&account).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

// FindByDocument finds an account by document (CNPJ)
func (r *AccountRepository) FindByDocument(document string) (*models.Account, error) {
	var account models.Account
	err := r.db.Where("document = ?", document).First(&account).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

// FindByEmail finds an account by email
func (r *AccountRepository) FindByEmail(email string) (*models.Account, error) {
	var account models.Account
	err := r.db.Where("email = ?", email).First(&account).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

// Update updates an account
func (r *AccountRepository) Update(account *models.Account) error {
	return r.db.Save(account).Error
}

// Delete soft deletes an account
func (r *AccountRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Account{}, id).Error
}

// List lists accounts with pagination and filters
func (r *AccountRepository) List(status *models.AccountStatus, page, perPage int) ([]models.Account, int64, error) {
	var accounts []models.Account
	var total int64

	query := r.db.Model(&models.Account{})

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
	err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&accounts).Error
	if err != nil {
		return nil, 0, err
	}

	return accounts, total, nil
}

// UpdateLimits updates account limits
func (r *AccountRepository) UpdateLimits(id uuid.UUID, maxCompanies, maxUsers, maxNFesPerMonth int) error {
	return r.db.Model(&models.Account{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"max_companies":       maxCompanies,
			"max_users":           maxUsers,
			"max_nfes_per_month": maxNFesPerMonth,
		}).Error
}

// UpdateStatus updates account status
func (r *AccountRepository) UpdateStatus(id uuid.UUID, status models.AccountStatus) error {
	return r.db.Model(&models.Account{}).
		Where("id = ?", id).
		Update("status", status).Error
}

// CountAll counts all accounts
func (r *AccountRepository) CountAll() (int64, error) {
	var count int64
	err := r.db.Model(&models.Account{}).Count(&count).Error
	return count, err
}

// CountByStatus counts accounts by status
func (r *AccountRepository) CountByStatus(status models.AccountStatus) (int64, error) {
	var count int64
	err := r.db.Model(&models.Account{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

