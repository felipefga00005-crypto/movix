package repositories

import (
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// UserCompanyRepository handles user-company relationship data access
type UserCompanyRepository struct {
	db *gorm.DB
}

// NewUserCompanyRepository creates a new user-company repository
func NewUserCompanyRepository(db *gorm.DB) *UserCompanyRepository {
	return &UserCompanyRepository{db: db}
}

// Create creates a new user-company relationship
func (r *UserCompanyRepository) Create(userCompany *models.UserCompany) error {
	return r.db.Create(userCompany).Error
}

// FindByUserAndCompany finds a user-company relationship
func (r *UserCompanyRepository) FindByUserAndCompany(userID, companyID uuid.UUID) (*models.UserCompany, error) {
	var userCompany models.UserCompany
	err := r.db.Where("user_id = ? AND company_id = ?", userID, companyID).First(&userCompany).Error
	if err != nil {
		return nil, err
	}
	return &userCompany, nil
}

// ListCompaniesByUser lists all companies for a user
func (r *UserCompanyRepository) ListCompaniesByUser(userID uuid.UUID) ([]models.UserCompany, error) {
	var userCompanies []models.UserCompany
	err := r.db.Preload("Company").Where("user_id = ?", userID).Find(&userCompanies).Error
	if err != nil {
		return nil, err
	}
	return userCompanies, nil
}

// ListUsersByCompany lists all users for a company
func (r *UserCompanyRepository) ListUsersByCompany(companyID uuid.UUID) ([]models.UserCompany, error) {
	var userCompanies []models.UserCompany
	err := r.db.Preload("User").Where("company_id = ?", companyID).Find(&userCompanies).Error
	if err != nil {
		return nil, err
	}
	return userCompanies, nil
}

// Delete deletes a user-company relationship
func (r *UserCompanyRepository) Delete(userID, companyID uuid.UUID) error {
	return r.db.Where("user_id = ? AND company_id = ?", userID, companyID).Delete(&models.UserCompany{}).Error
}

// HasAccess checks if a user has access to a company
func (r *UserCompanyRepository) HasAccess(userID, companyID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserCompany{}).
		Where("user_id = ? AND company_id = ?", userID, companyID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

