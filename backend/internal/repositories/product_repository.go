package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"github.com/movix/backend/internal/models"
)

// ProductRepository handles database operations for products
type ProductRepository struct {
	db *gorm.DB
}

// NewProductRepository creates a new product repository
func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// Create creates a new product
func (r *ProductRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

// FindByID finds a product by ID
func (r *ProductRepository) FindByID(id uuid.UUID) (*models.Product, error) {
	var product models.Product
	err := r.db.Where("id = ?", id).First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

// FindByCode finds a product by code within a company
func (r *ProductRepository) FindByCode(companyID uuid.UUID, code string) (*models.Product, error) {
	var product models.Product
	err := r.db.Where("company_id = ? AND code = ?", companyID, code).First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

// ListByCompany lists all products of a company
func (r *ProductRepository) ListByCompany(companyID uuid.UUID, activeOnly bool) ([]models.Product, error) {
	var products []models.Product
	query := r.db.Where("company_id = ?", companyID)
	
	if activeOnly {
		query = query.Where("active = ?", true)
	}
	
	err := query.Order("description ASC").Find(&products).Error
	return products, err
}

// Update updates a product
func (r *ProductRepository) Update(product *models.Product) error {
	return r.db.Save(product).Error
}

// Delete soft deletes a product
func (r *ProductRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Product{}, id).Error
}

// CountByCompany counts products of a company
func (r *ProductRepository) CountByCompany(companyID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.Product{}).Where("company_id = ?", companyID).Count(&count).Error
	return count, err
}

// FindByNCM finds products by NCM code
func (r *ProductRepository) FindByNCM(companyID uuid.UUID, ncm string) ([]models.Product, error) {
	var products []models.Product
	err := r.db.Where("company_id = ? AND ncm = ? AND active = ?", companyID, ncm, true).
		Order("description ASC").
		Find(&products).Error
	return products, err
}

// ExistsByCode checks if a product with the given code exists in the company
func (r *ProductRepository) ExistsByCode(companyID uuid.UUID, code string, excludeID *uuid.UUID) (bool, error) {
	var count int64
	query := r.db.Model(&models.Product{}).Where("company_id = ? AND code = ?", companyID, code)
	
	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}
	
	err := query.Count(&count).Error
	return count > 0, err
}

// Search searches products by code or description
func (r *ProductRepository) Search(companyID uuid.UUID, term string, limit int) ([]models.Product, error) {
	var products []models.Product
	query := r.db.Where("company_id = ? AND active = ?", companyID, true)
	
	if term != "" {
		query = query.Where("code ILIKE ? OR description ILIKE ? OR barcode = ?", "%"+term+"%", "%"+term+"%", term)
	}
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Order("description ASC").Find(&products).Error
	return products, err
}

// UpdateStock updates the stock of a product
func (r *ProductRepository) UpdateStock(productID uuid.UUID, quantity float64) error {
	return r.db.Model(&models.Product{}).
		Where("id = ?", productID).
		UpdateColumn("current_stock", gorm.Expr("current_stock + ?", quantity)).
		Error
}

