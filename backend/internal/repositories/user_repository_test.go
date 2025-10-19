package repositories

import (
	"testing"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestDB creates an in-memory SQLite database for testing
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	assert.NoError(t, err)

	// Manually create tables with compatible types for SQLite
	err = db.Exec(`
		CREATE TABLE accounts (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT NOT NULL,
			phone TEXT,
			document TEXT NOT NULL,
			max_companies INTEGER NOT NULL DEFAULT 10,
			max_users INTEGER NOT NULL DEFAULT 50,
			max_n_fes_per_month INTEGER NOT NULL DEFAULT 1000,
			status TEXT NOT NULL DEFAULT 'active',
			created_at DATETIME,
			updated_at DATETIME,
			deleted_at DATETIME
		)
	`).Error
	assert.NoError(t, err)

	err = db.Exec(`
		CREATE TABLE users (
			id TEXT PRIMARY KEY,
			account_id TEXT,
			email TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
			name TEXT NOT NULL,
			phone TEXT,
			role TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'active',
			created_at DATETIME,
			updated_at DATETIME,
			deleted_at DATETIME
		)
	`).Error
	assert.NoError(t, err)

	return db
}

func TestUserRepository_Create(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	user := &models.User{
		Email:    "test@example.com",
		Password: "hashedpassword",
		Name:     "Test User",
		Phone:    "+55 11 99999-9999",
		Role:     models.RoleUser,
		Status:   models.UserStatusActive,
	}

	err := repo.Create(user)
	assert.NoError(t, err)
	assert.NotEqual(t, uuid.Nil, user.ID)
}

func TestUserRepository_FindByID(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	// Create a user
	user := &models.User{
		Email:    "test@example.com",
		Password: "hashedpassword",
		Name:     "Test User",
		Phone:    "+55 11 99999-9999",
		Role:     models.RoleUser,
		Status:   models.UserStatusActive,
	}
	err := repo.Create(user)
	assert.NoError(t, err)

	// Find by ID
	found, err := repo.FindByID(user.ID)
	assert.NoError(t, err)
	assert.Equal(t, user.Email, found.Email)
	assert.Equal(t, user.Name, found.Name)
}

func TestUserRepository_FindByEmail(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	// Create a user
	user := &models.User{
		Email:    "test@example.com",
		Password: "hashedpassword",
		Name:     "Test User",
		Phone:    "+55 11 99999-9999",
		Role:     models.RoleUser,
		Status:   models.UserStatusActive,
	}
	err := repo.Create(user)
	assert.NoError(t, err)

	// Find by email
	found, err := repo.FindByEmail("test@example.com")
	assert.NoError(t, err)
	assert.Equal(t, user.ID, found.ID)
	assert.Equal(t, user.Name, found.Name)
}

func TestUserRepository_Update(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	// Create a user
	user := &models.User{
		Email:    "test@example.com",
		Password: "hashedpassword",
		Name:     "Test User",
		Phone:    "+55 11 99999-9999",
		Role:     models.RoleUser,
		Status:   models.UserStatusActive,
	}
	err := repo.Create(user)
	assert.NoError(t, err)

	// Update user
	user.Name = "Updated Name"
	err = repo.Update(user)
	assert.NoError(t, err)

	// Verify update
	found, err := repo.FindByID(user.ID)
	assert.NoError(t, err)
	assert.Equal(t, "Updated Name", found.Name)
}

func TestUserRepository_Delete(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	// Create a user
	user := &models.User{
		Email:    "test@example.com",
		Password: "hashedpassword",
		Name:     "Test User",
		Phone:    "+55 11 99999-9999",
		Role:     models.RoleUser,
		Status:   models.UserStatusActive,
	}
	err := repo.Create(user)
	assert.NoError(t, err)

	// Delete user
	err = repo.Delete(user.ID)
	assert.NoError(t, err)

	// Verify deletion (soft delete)
	_, err = repo.FindByID(user.ID)
	assert.Error(t, err)
	assert.Equal(t, gorm.ErrRecordNotFound, err)
}

func TestUserRepository_List(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	// Create account
	account := &models.Account{
		Name:     "Test Account",
		Email:    "account@example.com",
		Document: "12345678901234",
		Status:   models.AccountStatusActive,
	}
	err := db.Create(account).Error
	assert.NoError(t, err)

	// Create multiple users
	for i := 0; i < 5; i++ {
		user := &models.User{
			AccountID: &account.ID,
			Email:     "test" + string(rune(i)) + "@example.com",
			Password:  "hashedpassword",
			Name:      "Test User " + string(rune(i)),
			Phone:     "+55 11 99999-9999",
			Role:      models.RoleUser,
			Status:    models.UserStatusActive,
		}
		err := repo.Create(user)
		assert.NoError(t, err)
	}

	// List users
	users, total, err := repo.List(&account.ID, 1, 10)
	assert.NoError(t, err)
	assert.Equal(t, int64(5), total)
	assert.Len(t, users, 5)
}

func TestUserRepository_CountByAccount(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)

	// Create account
	account := &models.Account{
		Name:     "Test Account",
		Email:    "account@example.com",
		Document: "12345678901234",
		Status:   models.AccountStatusActive,
	}
	err := db.Create(account).Error
	assert.NoError(t, err)

	// Create users
	for i := 0; i < 3; i++ {
		user := &models.User{
			AccountID: &account.ID,
			Email:     "test" + string(rune(i)) + "@example.com",
			Password:  "hashedpassword",
			Name:      "Test User " + string(rune(i)),
			Phone:     "+55 11 99999-9999",
			Role:      models.RoleUser,
			Status:    models.UserStatusActive,
		}
		err := repo.Create(user)
		assert.NoError(t, err)
	}

	// Count users
	count, err := repo.CountByAccount(account.ID)
	assert.NoError(t, err)
	assert.Equal(t, int64(3), count)
}

