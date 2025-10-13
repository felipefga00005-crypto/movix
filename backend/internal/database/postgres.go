package database

import (
	"fmt"
	"log"

	"github.com/movix/backend/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB



func Connect(cfg *config.Config) error {
	var err error

	dsn := cfg.GetDSN()

	// Configuração do logger do GORM
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	if cfg.Server.Env == "production" {
		gormConfig.Logger = logger.Default.LogMode(logger.Error)
	}

	DB, err = gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("✅ Database connected successfully")

	return nil
}

func AutoMigrate(models ...interface{}) error {
	if err := DB.AutoMigrate(models...); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}
	
	log.Println("✅ Database migrated successfully")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}

