package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"github.com/movix/backend/internal/models"
)

// CustomerRepository handles database operations for customers
type CustomerRepository struct {
	db *gorm.DB
}

// NewCustomerRepository creates a new customer repository
func NewCustomerRepository(db *gorm.DB) *CustomerRepository {
	return &CustomerRepository{db: db}
}

// Create creates a new customer
func (r *CustomerRepository) Create(customer *models.Customer) error {
	return r.db.Create(customer).Error
}

// FindByID finds a customer by ID
func (r *CustomerRepository) FindByID(id uuid.UUID) (*models.Customer, error) {
	var customer models.Customer
	err := r.db.Where("id = ?", id).First(&customer).Error
	if err != nil {
		return nil, err
	}
	return &customer, nil
}

// FindByDocument finds a customer by document (CPF/CNPJ) within a company
func (r *CustomerRepository) FindByDocument(companyID uuid.UUID, document string) (*models.Customer, error) {
	var customer models.Customer
	err := r.db.Where("company_id = ? AND document = ?", companyID, document).First(&customer).Error
	if err != nil {
		return nil, err
	}
	return &customer, nil
}

// ListByCompany lists all customers of a company
func (r *CustomerRepository) ListByCompany(companyID uuid.UUID, activeOnly bool) ([]models.Customer, error) {
	var customers []models.Customer
	query := r.db.Where("company_id = ?", companyID)
	
	if activeOnly {
		query = query.Where("active = ?", true)
	}
	
	err := query.Order("name ASC").Find(&customers).Error
	return customers, err
}

// Update updates a customer
func (r *CustomerRepository) Update(customer *models.Customer) error {
	return r.db.Save(customer).Error
}

// Delete soft deletes a customer
func (r *CustomerRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Customer{}, id).Error
}

// CountByCompany counts customers of a company
func (r *CustomerRepository) CountByCompany(companyID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.Customer{}).Where("company_id = ?", companyID).Count(&count).Error
	return count, err
}

// ExistsByDocument checks if a customer with the given document exists in the company
func (r *CustomerRepository) ExistsByDocument(companyID uuid.UUID, document string, excludeID *uuid.UUID) (bool, error) {
	var count int64
	query := r.db.Model(&models.Customer{}).Where("company_id = ? AND document = ?", companyID, document)
	
	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}
	
	err := query.Count(&count).Error
	return count > 0, err
}

// Search searches customers by name or document
func (r *CustomerRepository) Search(companyID uuid.UUID, term string, limit int) ([]models.Customer, error) {
	var customers []models.Customer
	query := r.db.Where("company_id = ? AND active = ?", companyID, true)
	
	if term != "" {
		query = query.Where("name ILIKE ? OR document ILIKE ?", "%"+term+"%", "%"+term+"%")
	}
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Order("name ASC").Find(&customers).Error
	return customers, err
}

