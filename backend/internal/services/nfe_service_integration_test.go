package services_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/internal/services"
	"github.com/movix/backend/internal/validators"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestDB creates an in-memory SQLite database for testing
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	// Auto migrate all models
	err = db.AutoMigrate(
		&models.Account{},
		&models.User{},
		&models.Company{},
		&models.Customer{},
		&models.Product{},
		&models.Carrier{},
		&models.Certificate{},
		&models.NFe{},
		&models.NFeItem{},
		&models.NFePayment{},
		&models.NFeVolume{},
		&models.UserCompany{},
	)
	require.NoError(t, err)

	return db
}

// createTestAccount creates a test account
func createTestAccount(t *testing.T, db *gorm.DB) *models.Account {
	account := &models.Account{
		Name:              "Test Account",
		Document:          "12345678901234",
		Email:             "test@example.com",
		Phone:             "11999999999",
		Status:            models.AccountStatusActive,
		MaxCompanies:      10,
		MaxNFesPerMonth:   1000,
		MaxUsers:          50,
	}
	err := db.Create(account).Error
	require.NoError(t, err)
	return account
}

// createTestCompany creates a test company
func createTestCompany(t *testing.T, db *gorm.DB, accountID uuid.UUID) *models.Company {
	company := &models.Company{
		AccountID:         accountID,
		Document:          "12345678000195",
		Name:              "Test Company LTDA",
		TradeName:         "Test Company",
		StateRegistration: "123456789",
		TaxRegime:         models.TaxRegimeSimplesNacional,
		Status:            models.CompanyStatusActive,
		Environment:       models.EnvironmentHomologacao,
		NFeSeries:         1,
		NextNFeNumber:     1,
		Address: models.Address{
			Street:      "Rua Teste",
			Number:      "123",
			District:    "Centro",
			City:        "São Paulo",
			State:       "SP",
			ZipCode:     "01310100",
			CountryCode: "1058",
			Country:     "Brasil",
			CityCode:    "3550308",
		},
	}
	err := db.Create(company).Error
	require.NoError(t, err)
	return company
}

// createTestUser creates a test user
func createTestUser(t *testing.T, db *gorm.DB, accountID uuid.UUID) *models.User {
	user := &models.User{
		AccountID: accountID,
		Name:      "Test User",
		Email:     "user@test.com",
		Password:  "hashedpassword",
		Role:      models.UserRoleAdmin,
		Status:    models.UserStatusActive,
	}
	err := db.Create(user).Error
	require.NoError(t, err)
	return user
}

// createTestCustomer creates a test customer
func createTestCustomer() models.Customer {
	return models.Customer{
		PersonType:            models.PersonTypePhysical,
		Document:              "12345678901",
		Name:                  "Test Customer",
		Email:                 "customer@test.com",
		Phone:                 "11988888888",
		StateRegistrationType: "nao_contribuinte",
		Address: models.Address{
			Street:      "Rua Cliente",
			Number:      "456",
			District:    "Jardim",
			City:        "São Paulo",
			State:       "SP",
			ZipCode:     "01310200",
			CountryCode: "1058",
			Country:     "Brasil",
			CityCode:    "3550308",
		},
	}
}

// createTestNFeItems creates test NFe items
func createTestNFeItems() []models.NFeItem {
	return []models.NFeItem{
		{
			ItemNumber:  1,
			Code:        "PROD001",
			Description: "Produto Teste 1",
			NCM:         "12345678",
			CFOP:        "5102",
			Unit:        "UN",
			Quantity:    2.0,
			UnitPrice:   100.00,
			TotalPrice:  200.00,
			Origin:      0,
		},
		{
			ItemNumber:  2,
			Code:        "PROD002",
			Description: "Produto Teste 2",
			NCM:         "87654321",
			CFOP:        "5102",
			Unit:        "UN",
			Quantity:    1.0,
			UnitPrice:   50.00,
			TotalPrice:  50.00,
			Origin:      0,
		},
	}
}

func TestNFeService_CreateDraft(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	account := createTestAccount(t, db)
	company := createTestCompany(t, db, account.ID)
	user := createTestUser(t, db, account.ID)

	// Create repositories
	nfeRepo := repositories.NewNFeRepository(db)
	companyRepo := repositories.NewCompanyRepository(db)
	accountRepo := repositories.NewAccountRepository(db)

	// Create services
	taxCalculator := services.NewTaxCalculatorService()
	fiscalValidator := validators.NewFiscalValidator()
	nfeService := services.NewNFeService(
		nfeRepo,
		companyRepo,
		accountRepo,
		nil, // acbrService not needed for this test
		nil, // dfeService not needed for this test
		taxCalculator,
		fiscalValidator,
	)

	// Test data
	customer := createTestCustomer()
	items := createTestNFeItems()

	req := services.CreateNFeRequest{
		CompanyID: company.ID,
		Customer:  customer,
		Items:     items,
	}

	// Execute
	result, err := nfeService.CreateDraft(user.ID, req)

	// Assert
	require.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, models.NFeStatusDraft, result.Status)
	assert.Equal(t, company.ID, result.CompanyID)
	assert.Equal(t, user.ID, result.UserID)
	assert.Equal(t, 1, result.Number)
	assert.Equal(t, 1, result.Series)
	assert.Equal(t, "55", result.Model)
	assert.Equal(t, 2, len(result.Items))

	// Verify taxes were calculated
	for _, item := range result.Items {
		assert.Greater(t, item.ICMSRate, 0.0, "ICMS rate should be calculated")
		assert.Greater(t, item.PISRate, 0.0, "PIS rate should be calculated")
		assert.Greater(t, item.COFINSRate, 0.0, "COFINS rate should be calculated")
	}

	// Verify totals
	assert.Equal(t, 250.0, result.TotalProducts)
	assert.Greater(t, result.TotalNFe, 0.0)
}

func TestNFeService_ValidateLimits(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	account := createTestAccount(t, db)
	company := createTestCompany(t, db, account.ID)

	// Set monthly limit
	account.MaxNFesPerMonth = 5
	db.Save(account)

	// Create repositories
	nfeRepo := repositories.NewNFeRepository(db)
	companyRepo := repositories.NewCompanyRepository(db)
	accountRepo := repositories.NewAccountRepository(db)

	// Create service
	nfeService := services.NewNFeService(
		nfeRepo,
		companyRepo,
		accountRepo,
		nil, nil, nil, nil,
	)

	// Create 5 NFes for current month
	now := time.Now()
	for i := 0; i < 5; i++ {
		nfe := &models.NFe{
			CompanyID:     company.ID,
			Number:        i + 1,
			Series:        1,
			Model:         "55",
			Status:        models.NFeStatusAuthorized,
			TotalProducts: 100.0,
			TotalNFe:      100.0,
			IssuedAt:      &now,
		}
		db.Create(nfe)
	}

	// Test - should fail because limit is reached
	err := nfeService.ValidateLimits(company)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "limit reached")
}

func TestFiscalValidator_ValidateCNPJ(t *testing.T) {
	validator := validators.NewFiscalValidator()

	tests := []struct {
		name    string
		cnpj    string
		wantErr bool
	}{
		{"Valid CNPJ", "11222333000181", false},
		{"Valid CNPJ with formatting", "11.222.333/0001-81", false},
		{"Invalid CNPJ - wrong length", "123456", true},
		{"Invalid CNPJ - all same digits", "11111111111111", true},
		{"Invalid CNPJ - wrong check digit", "11222333000180", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.ValidateCNPJ(tt.cnpj)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestFiscalValidator_ValidateCPF(t *testing.T) {
	validator := validators.NewFiscalValidator()

	tests := []struct {
		name    string
		cpf     string
		wantErr bool
	}{
		{"Valid CPF", "12345678909", false},
		{"Valid CPF with formatting", "123.456.789-09", false},
		{"Invalid CPF - wrong length", "123456", true},
		{"Invalid CPF - all same digits", "11111111111", true},
		{"Invalid CPF - wrong check digit", "12345678900", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.ValidateCPF(tt.cpf)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestTaxCalculator_SimplesNacional(t *testing.T) {
	calculator := services.NewTaxCalculatorService()

	req := services.TaxCalculationRequest{
		TaxRegime:    models.TaxRegimeSimplesNacional,
		UF:           "SP",
		ProductValue: 100.0,
		Quantity:     2.0,
		NCM:          "12345678",
		CFOP:         "5102",
		CustomerUF:   "SP",
	}

	result, err := calculator.CalculateTaxes(req)

	require.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 200.0, result.TotalProduct)
	assert.Equal(t, 102, result.ICMSCSOSN) // Simples Nacional CSOSN 102
	assert.Equal(t, 0.0, result.ICMSValue)  // Simples Nacional não destaca ICMS
	assert.Equal(t, 0.0, result.PISValue)   // Simples Nacional não destaca PIS/COFINS
	assert.Equal(t, 0.0, result.COFINSValue)
}

func TestTaxCalculator_LucroPresumido(t *testing.T) {
	calculator := services.NewTaxCalculatorService()

	req := services.TaxCalculationRequest{
		TaxRegime:    models.TaxRegimePresumido,
		UF:           "SP",
		ProductValue: 100.0,
		Quantity:     2.0,
		NCM:          "12345678",
		CFOP:         "5102",
		CustomerUF:   "SP",
	}

	result, err := calculator.CalculateTaxes(req)

	require.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 200.0, result.TotalProduct)
	assert.Greater(t, result.ICMSValue, 0.0)   // Should calculate ICMS
	assert.Equal(t, 0.65, result.PISRate)      // Regime cumulativo
	assert.Equal(t, 3.0, result.COFINSRate)    // Regime cumulativo
	assert.Greater(t, result.PISValue, 0.0)
	assert.Greater(t, result.COFINSValue, 0.0)
}

