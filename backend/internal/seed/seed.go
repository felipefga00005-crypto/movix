package seed

import (
	"log"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/pkg/utils"
)

// Run executes the database seed
func Run() error {
	log.Println("  → Seeding database...")

	// Create Super Admin
	if err := createSuperAdmin(); err != nil {
		return err
	}

	// Create sample empresa
	empresa, err := createEmpresa()
	if err != nil {
		return err
	}

	// Create admin user for empresa
	if err := createAdminUser(empresa.ID); err != nil {
		return err
	}

	// Create regular user for empresa
	if err := createRegularUser(empresa.ID); err != nil {
		return err
	}

	// Create sample modules
	if err := createModules(); err != nil {
		return err
	}

	// Activate modules for empresa
	if err := activateModulesForEmpresa(empresa.ID); err != nil {
		return err
	}

	// Create sample CNPJ
	if err := createCNPJ(empresa.ID); err != nil {
		return err
	}

	log.Println("\n  ✓ Seed completed successfully!")
	log.Println("\n  📋 Default Credentials:")
	log.Println("     Super Admin: admin@movix.com / admin123")
	log.Println("     Admin User:  admin@empresa.com / admin123")
	log.Println("     Regular User: user@empresa.com / user123")

	return nil
}

func createSuperAdmin() error {
	hashedPassword, err := utils.HashPassword("admin123")
	if err != nil {
		return err
	}

	superAdmin := models.SuperAdmin{
		Email:        "admin@movix.com",
		PasswordHash: hashedPassword,
		Nome:         "Super Admin",
		Ativo:        true,
	}

	result := database.DB.Where("email = ?", superAdmin.Email).FirstOrCreate(&superAdmin)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected > 0 {
		log.Println("     ✓ Super Admin created: admin@movix.com")
	} else {
		log.Println("     → Super Admin already exists: admin@movix.com")
	}

	return nil
}

func createEmpresa() (*models.Empresa, error) {
	empresa := models.Empresa{
		Nome:        "Empresa Demo",
		RazaoSocial: "Empresa Demo LTDA",
		Plano:       "premium",
		Status:      "active",
		Ativo:       true,
	}

	result := database.DB.Where("nome = ?", empresa.Nome).FirstOrCreate(&empresa)
	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected > 0 {
		log.Printf("     ✓ Empresa created: %s", empresa.Nome)
	} else {
		log.Printf("     → Empresa already exists: %s", empresa.Nome)
	}

	return &empresa, nil
}

func createAdminUser(empresaID uuid.UUID) error {
	hashedPassword, err := utils.HashPassword("admin123")
	if err != nil {
		return err
	}

	adminUser := models.Usuario{
		EmpresaID:    empresaID,
		Email:        "admin@empresa.com",
		PasswordHash: hashedPassword,
		Nome:         "Admin Empresa",
		Role:         models.RoleAdmin,
		Ativo:        true,
	}

	result := database.DB.Where("email = ?", adminUser.Email).FirstOrCreate(&adminUser)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected > 0 {
		log.Println("     ✓ Admin User created: admin@empresa.com")
	} else {
		log.Println("     → Admin User already exists: admin@empresa.com")
	}

	return nil
}

func createRegularUser(empresaID uuid.UUID) error {
	hashedPassword, err := utils.HashPassword("user123")
	if err != nil {
		return err
	}

	regularUser := models.Usuario{
		EmpresaID:    empresaID,
		Email:        "user@empresa.com",
		PasswordHash: hashedPassword,
		Nome:         "Usuário Regular",
		Role:         models.RoleUser,
		Ativo:        true,
	}

	result := database.DB.Where("email = ?", regularUser.Email).FirstOrCreate(&regularUser)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected > 0 {
		log.Println("     ✓ Regular User created: user@empresa.com")
	} else {
		log.Println("     → Regular User already exists: user@empresa.com")
	}

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

func activateModulesForEmpresa(empresaID uuid.UUID) error {
	var modulos []models.Modulo
	if err := database.DB.Find(&modulos).Error; err != nil {
		return err
	}

	for _, mod := range modulos {
		empresaModulo := models.EmpresaModulo{
			EmpresaID: empresaID,
			ModuloID:  mod.ID,
			Ativo:     true,
		}

		result := database.DB.Where("empresa_id = ? AND modulo_id = ?", empresaID, mod.ID).FirstOrCreate(&empresaModulo)
		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected > 0 {
			log.Printf("     ✓ Module %s activated for empresa", mod.Nome)
		}
	}

	return nil
}

func createCNPJ(empresaID uuid.UUID) error {
	cnpj := models.CNPJ{
		EmpresaID:    empresaID,
		CNPJ:         "12345678000190",
		RazaoSocial:  "Empresa Demo LTDA",
		NomeFantasia: "Empresa Demo",
		Autorizado:   true,
		Ativo:        true,
	}

	result := database.DB.Where("cnpj = ?", cnpj.CNPJ).FirstOrCreate(&cnpj)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected > 0 {
		log.Printf("     ✓ CNPJ created: %s", cnpj.CNPJ)
	} else {
		log.Printf("     → CNPJ already exists: %s", cnpj.CNPJ)
	}

	return nil
}

