package seed

import (
	"log"

	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/models"
)

// Run executes the database seed
func Run() error {
	log.Println("  → Checking database status...")

	// Check if there's already a super admin
	var superAdminCount int64
	database.DB.Model(&models.SuperAdmin{}).Count(&superAdminCount)

	if superAdminCount == 0 {
		log.Println("  ⚠️  No Super Admin found.")
		log.Println("  ℹ️  Please access http://localhost:3002/setup to create the first Super Admin")
	} else {
		log.Println("  ✓ Super Admin exists")
	}

	// Create default modules (these are system modules, not user data)
	if err := createModules(); err != nil {
		return err
	}

	log.Println("\n  ✓ Database check completed!")

	return nil
}



func createModules() error {
	modules := []models.Modulo{
		{Nome: "NF-e", Descricao: "Nota Fiscal Eletrônica", Slug: "nfe", Ativo: true},
		{Nome: "NFC-e", Descricao: "Nota Fiscal de Consumidor Eletrônica", Slug: "nfce", Ativo: true},
		{Nome: "CT-e", Descricao: "Conhecimento de Transporte Eletrônico", Slug: "cte", Ativo: true},
		{Nome: "MDF-e", Descricao: "Manifesto de Documentos Fiscais Eletrônico", Slug: "mdfe", Ativo: true},
	}

	for _, mod := range modules {
		result := database.DB.Where("slug = ?", mod.Slug).FirstOrCreate(&mod)
		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected > 0 {
			log.Printf("     ✓ Module created: %s", mod.Nome)
		} else {
			log.Printf("     → Module already exists: %s", mod.Nome)
		}
	}

	return nil
}



