package repositories

import (
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// CarrierRepository handles database operations for carriers
type CarrierRepository struct {
	db *gorm.DB
}

// NewCarrierRepository creates a new carrier repository
func NewCarrierRepository(db *gorm.DB) *CarrierRepository {
	return &CarrierRepository{db: db}
}

// Create creates a new carrier
func (r *CarrierRepository) Create(carrier *models.Carrier) error {
	return r.db.Create(carrier).Error
}

// FindByID finds a carrier by ID
func (r *CarrierRepository) FindByID(id uuid.UUID) (*models.Carrier, error) {
	var carrier models.Carrier
	err := r.db.Where("id = ?", id).First(&carrier).Error
	if err != nil {
		return nil, err
	}
	return &carrier, nil
}

// ListByCompany lists all carriers of a company
func (r *CarrierRepository) ListByCompany(companyID uuid.UUID, activeOnly bool) ([]models.Carrier, error) {
	var carriers []models.Carrier
	query := r.db.Where("company_id = ?", companyID)
	
	if activeOnly {
		query = query.Where("active = ?", true)
	}
	
	err := query.Order("name ASC").Find(&carriers).Error
	return carriers, err
}

// Update updates a carrier
func (r *CarrierRepository) Update(carrier *models.Carrier) error {
	return r.db.Save(carrier).Error
}

// Delete soft deletes a carrier
func (r *CarrierRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Carrier{}, id).Error
}

// Search searches carriers by name or document
func (r *CarrierRepository) Search(companyID uuid.UUID, term string, limit int) ([]models.Carrier, error) {
	var carriers []models.Carrier
	query := r.db.Where("company_id = ? AND active = ?", companyID, true)
	
	if term != "" {
		query = query.Where("name ILIKE ? OR document ILIKE ?", "%"+term+"%", "%"+term+"%")
	}
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Order("name ASC").Find(&carriers).Error
	return carriers, err
}

