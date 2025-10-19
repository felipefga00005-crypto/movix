package repositories

import (
	"time"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// NFeRepository handles NFe data access
type NFeRepository struct {
	db *gorm.DB
}

// NewNFeRepository creates a new NFe repository
func NewNFeRepository(db *gorm.DB) *NFeRepository {
	return &NFeRepository{db: db}
}

// Create creates a new NFe
func (r *NFeRepository) Create(nfe *models.NFe) error {
	return r.db.Create(nfe).Error
}

// FindByID finds a NFe by ID
func (r *NFeRepository) FindByID(id uuid.UUID) (*models.NFe, error) {
	var nfe models.NFe
	err := r.db.Where("id = ?", id).First(&nfe).Error
	if err != nil {
		return nil, err
	}
	return &nfe, nil
}

// FindByAccessKey finds a NFe by access key
func (r *NFeRepository) FindByAccessKey(accessKey string) (*models.NFe, error) {
	var nfe models.NFe
	err := r.db.Where("access_key = ?", accessKey).First(&nfe).Error
	if err != nil {
		return nil, err
	}
	return &nfe, nil
}

// FindByNumber finds a NFe by company, series and number
func (r *NFeRepository) FindByNumber(companyID uuid.UUID, series, number int) (*models.NFe, error) {
	var nfe models.NFe
	err := r.db.Where("company_id = ? AND series = ? AND number = ?", companyID, series, number).First(&nfe).Error
	if err != nil {
		return nil, err
	}
	return &nfe, nil
}

// Update updates a NFe
func (r *NFeRepository) Update(nfe *models.NFe) error {
	return r.db.Save(nfe).Error
}

// UpdateStatus updates NFe status
func (r *NFeRepository) UpdateStatus(id uuid.UUID, status models.NFeStatus) error {
	return r.db.Model(&models.NFe{}).
		Where("id = ?", id).
		Update("status", status).Error
}

// UpdateAuthorization updates NFe authorization data
func (r *NFeRepository) UpdateAuthorization(id uuid.UUID, accessKey, protocol, xml string, status models.NFeStatus) error {
	return r.db.Model(&models.NFe{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"access_key": accessKey,
			"protocol":   protocol,
			"xml":        xml,
			"status":     status,
		}).Error
}

// Delete soft deletes a NFe
func (r *NFeRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.NFe{}, id).Error
}

// NFeListFilters represents filters for listing NFes
type NFeListFilters struct {
	CompanyID  *uuid.UUID
	UserID     *uuid.UUID
	Status     *models.NFeStatus
	StartDate  *time.Time
	EndDate    *time.Time
	SearchTerm string // Search in customer name or access key
}

// List lists NFes with filters and pagination
func (r *NFeRepository) List(filters NFeListFilters, page, perPage int) ([]models.NFe, int64, error) {
	var nfes []models.NFe
	var total int64

	query := r.db.Model(&models.NFe{})

	// Apply filters
	if filters.CompanyID != nil {
		query = query.Where("company_id = ?", *filters.CompanyID)
	}

	if filters.UserID != nil {
		query = query.Where("user_id = ?", *filters.UserID)
	}

	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}

	if filters.StartDate != nil {
		query = query.Where("created_at >= ?", *filters.StartDate)
	}

	if filters.EndDate != nil {
		query = query.Where("created_at <= ?", *filters.EndDate)
	}

	if filters.SearchTerm != "" {
		query = query.Where("customer->>'name' ILIKE ? OR access_key LIKE ?",
			"%"+filters.SearchTerm+"%", "%"+filters.SearchTerm+"%")
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * perPage
	err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&nfes).Error
	if err != nil {
		return nil, 0, err
	}

	return nfes, total, nil
}

// CountByCompany counts NFes by company
func (r *NFeRepository) CountByCompany(companyID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.NFe{}).Where("company_id = ?", companyID).Count(&count).Error
	return count, err
}

// CountByCompanyAndStatus counts NFes by company and status
func (r *NFeRepository) CountByCompanyAndStatus(companyID uuid.UUID, status models.NFeStatus) (int64, error) {
	var count int64
	err := r.db.Model(&models.NFe{}).
		Where("company_id = ? AND status = ?", companyID, status).
		Count(&count).Error
	return count, err
}

// CountByCompanyAndMonth counts NFes by company in a specific month
func (r *NFeRepository) CountByCompanyAndMonth(companyID uuid.UUID, year, month int) (int64, error) {
	var count int64
	
	// Create start and end dates for the month
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

	err := r.db.Model(&models.NFe{}).
		Where("company_id = ? AND created_at >= ? AND created_at <= ?", companyID, startDate, endDate).
		Count(&count).Error
	
	return count, err
}

// CountByAccountAndMonth counts NFes by account in a specific month
func (r *NFeRepository) CountByAccountAndMonth(accountID uuid.UUID, year, month int) (int64, error) {
	var count int64
	
	// Create start and end dates for the month
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

	err := r.db.Model(&models.NFe{}).
		Joins("JOIN companies ON companies.id = nfes.company_id").
		Where("companies.account_id = ? AND nfes.created_at >= ? AND nfes.created_at <= ?", accountID, startDate, endDate).
		Count(&count).Error
	
	return count, err
}

// GetTotalValueByCompany gets total value of NFes by company
func (r *NFeRepository) GetTotalValueByCompany(companyID uuid.UUID) (float64, error) {
	var total float64
	err := r.db.Model(&models.NFe{}).
		Where("company_id = ? AND status = ?", companyID, models.NFeStatusAuthorized).
		Select("COALESCE(SUM(total_nfe), 0)").
		Scan(&total).Error
	return total, err
}

// GetTotalValueByCompanyAndPeriod gets total value of NFes by company in a period
func (r *NFeRepository) GetTotalValueByCompanyAndPeriod(companyID uuid.UUID, startDate, endDate time.Time) (float64, error) {
	var total float64
	err := r.db.Model(&models.NFe{}).
		Where("company_id = ? AND status = ? AND created_at >= ? AND created_at <= ?",
			companyID, models.NFeStatusAuthorized, startDate, endDate).
		Select("COALESCE(SUM(total_nfe), 0)").
		Scan(&total).Error
	return total, err
}

// ListByCompanyAndStatus lists NFes by company and status
func (r *NFeRepository) ListByCompanyAndStatus(companyID uuid.UUID, status models.NFeStatus, limit int) ([]models.NFe, error) {
	var nfes []models.NFe
	err := r.db.Where("company_id = ? AND status = ?", companyID, status).
		Order("created_at DESC").
		Limit(limit).
		Find(&nfes).Error
	return nfes, err
}

// GetLastNFeNumber gets the last NFe number for a company and series
func (r *NFeRepository) GetLastNFeNumber(companyID uuid.UUID, series int) (int, error) {
	var nfe models.NFe
	err := r.db.Where("company_id = ? AND series = ?", companyID, series).
		Order("number DESC").
		First(&nfe).Error
	
	if err == gorm.ErrRecordNotFound {
		return 0, nil
	}
	
	if err != nil {
		return 0, err
	}
	
	return nfe.Number, nil
}

