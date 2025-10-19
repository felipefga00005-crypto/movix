package repositories

import (
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// UserRepository handles user data access
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// FindByID finds a user by ID
func (r *UserRepository) FindByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByEmail finds a user by email
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByIDWithAccount finds a user by ID and preloads account
func (r *UserRepository) FindByIDWithAccount(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Account").Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Update updates a user
func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// Delete soft deletes a user
func (r *UserRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.User{}, id).Error
}

// List lists users with pagination
func (r *UserRepository) List(accountID *uuid.UUID, page, perPage int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := r.db.Model(&models.User{})
	
	if accountID != nil {
		query = query.Where("account_id = ?", accountID)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (page - 1) * perPage
	err := query.Offset(offset).Limit(perPage).Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// CountByAccount counts users by account ID
func (r *UserRepository) CountByAccount(accountID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("account_id = ?", accountID).Count(&count).Error
	return count, err
}

