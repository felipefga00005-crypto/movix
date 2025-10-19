package database

import (
	"fmt"
	"log"
	"time"

	"github.com/movix/backend/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect establishes a connection to the PostgreSQL database
func Connect(cfg *config.Config) error {
	var err error
	
	dsn := cfg.GetDSN()
	
	// Configure GORM logger
	var gormLogger logger.Interface
	if cfg.Logging.Level == "debug" {
		gormLogger = logger.Default.LogMode(logger.Info)
	} else {
		gormLogger = logger.Default.LogMode(logger.Silent)
	}
	
	// Connect to database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	
	// Get underlying SQL database
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}
	
	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	
	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}
	
	log.Println("✅ Database connection established successfully")
	
	return nil
}

// Close closes the database connection
func Close() error {
	if DB == nil {
		return nil
	}
	
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}
	
	if err := sqlDB.Close(); err != nil {
		return fmt.Errorf("failed to close database connection: %w", err)
	}
	
	log.Println("✅ Database connection closed successfully")
	
	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}

