package database

import (
	"fmt"
	"log"

	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/models"
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

	// Executar seeds automáticos após migração
	if err := SeedEssentialData(); err != nil {
		log.Printf("⚠️  Warning: Failed to seed essential data: %v", err)
		// Não retorna erro para não impedir a inicialização
	}

	return nil
}

func GetDB() *gorm.DB {
	return DB
}

// SeedEssentialData popula o banco com dados essenciais
func SeedEssentialData() error {
	log.Println("🌱 Starting essential data seeding...")

	// Seed CFOPs
	if err := seedCFOPs(); err != nil {
		return fmt.Errorf("failed to seed CFOPs: %w", err)
	}

	// Seed CSTs
	if err := seedCSTs(); err != nil {
		return fmt.Errorf("failed to seed CSTs: %w", err)
	}

	// Seed CSOSNs
	if err := seedCSOSNs(); err != nil {
		return fmt.Errorf("failed to seed CSOSNs: %w", err)
	}

	// Seed Naturezas de Operação
	if err := seedNaturezasOperacao(); err != nil {
		return fmt.Errorf("failed to seed Naturezas de Operação: %w", err)
	}

	// Seed Unidades de Medida
	if err := seedUnidadesMedida(); err != nil {
		return fmt.Errorf("failed to seed Unidades de Medida: %w", err)
	}

	// Seed Estados e Cidades (dados básicos)
	if err := seedEstadosBasicos(); err != nil {
		return fmt.Errorf("failed to seed Estados: %w", err)
	}

	log.Println("✅ Essential data seeded successfully")
	return nil
}

