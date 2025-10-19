package seeds

import (
	"log"

	"github.com/movix/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// CreateSuperAdmin creates the initial superadmin user
func CreateSuperAdmin(db *gorm.DB) error {
	// Check if superadmin already exists
	var count int64
	if err := db.Model(&models.User{}).Where("role = ?", models.RoleSuperAdmin).Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		log.Println("ℹ️  SuperAdmin already exists, skipping seed")
		return nil
	}

	// Hash password
	password := "admin123" // Default password - CHANGE IN PRODUCTION!
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Create superadmin user
	superadmin := &models.User{
		AccountID: nil, // SuperAdmin has no account
		Email:     "admin@movix.com",
		Password:  string(hashedPassword),
		Name:      "Super Administrator",
		Phone:     "+55 11 99999-9999",
		Role:      models.RoleSuperAdmin,
		Status:    models.UserStatusActive,
	}

	if err := db.Create(superadmin).Error; err != nil {
		return err
	}

	log.Println("✅ SuperAdmin created successfully")
	log.Println("📧 Email: admin@movix.com")
	log.Println("🔑 Password: admin123")
	log.Println("⚠️  IMPORTANT: Change the password in production!")

	return nil
}

// SeedAll runs all seeds
func SeedAll(db *gorm.DB) error {
	log.Println("🌱 Running database seeds...")

	if err := CreateSuperAdmin(db); err != nil {
		log.Printf("❌ Failed to create SuperAdmin: %v", err)
		return err
	}

	log.Println("✅ All seeds completed successfully")
	return nil
}

