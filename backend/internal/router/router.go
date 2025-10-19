package router

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/handlers"
	"github.com/movix/backend/internal/middleware"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/internal/services"
	"github.com/movix/backend/internal/validators"
	"github.com/movix/backend/pkg/jwt"
	"gorm.io/gorm"
)

// SetupRouter configures all routes
func SetupRouter(db *gorm.DB, cfg *config.Config) *gin.Engine {
	// Create router
	router := gin.New()

	// Global middlewares
	router.Use(gin.Recovery())
	router.Use(middleware.RequestID())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS(cfg))

	// Initialize JWT manager
	jwtManager := jwt.NewJWTManager(
		cfg.JWT.Secret,
		cfg.JWT.Expiration,
		cfg.JWT.RefreshExpiration,
	)

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	userCompanyRepo := repositories.NewUserCompanyRepository(db)
	accountRepo := repositories.NewAccountRepository(db)
	companyRepo := repositories.NewCompanyRepository(db)
	certRepo := repositories.NewCertificateRepository(db)
	nfeRepo := repositories.NewNFeRepository(db)
	customerRepo := repositories.NewCustomerRepository(db)
	productRepo := repositories.NewProductRepository(db)
	carrierRepo := repositories.NewCarrierRepository(db)

	// Initialize validators
	fiscalValidator := validators.NewFiscalValidator()

	// Initialize services
	authService := services.NewAuthService(userRepo, userCompanyRepo, jwtManager)
	accountService := services.NewAccountService(accountRepo, userRepo)
	companyService := services.NewCompanyService(companyRepo, accountRepo)
	userService := services.NewUserService(userRepo, accountRepo, userCompanyRepo)
	certService := services.NewCertificateService(certRepo, companyRepo, cfg.Encryption.Key)
	dfeService := services.NewDFeService(cfg.DFe.ServiceURL, cfg.DFe.Timeout, companyRepo, certRepo, certService)
	taxCalculator := services.NewTaxCalculatorService()
	nfeService := services.NewNFeService(nfeRepo, companyRepo, accountRepo, dfeService, taxCalculator, fiscalValidator)
	customerService := services.NewCustomerService(customerRepo)
	productService := services.NewProductService(productRepo)
	carrierService := services.NewCarrierService(carrierRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	accountHandler := handlers.NewAccountHandler(accountService)
	companyHandler := handlers.NewCompanyHandler(companyService)
	userHandler := handlers.NewUserHandler(userService)
	certHandler := handlers.NewCertificateHandler(certService)
	nfeHandler := handlers.NewNFeHandler(nfeService)
	customerHandler := handlers.NewCustomerHandler(customerService)
	productHandler := handlers.NewProductHandler(productService)
	carrierHandler := handlers.NewCarrierHandler(carrierService)

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Movix API is running",
			"version": "1.0.0",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public routes (no authentication required)
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authHandler.HandleLogin)
			auth.POST("/refresh", authHandler.HandleRefresh)
		}

		// Protected routes (authentication required)
		authenticated := v1.Group("")
		authenticated.Use(middleware.AuthMiddleware(jwtManager))
		{
			// Auth routes
			authRoutes := authenticated.Group("/auth")
			{
				authRoutes.POST("/switch-company", authHandler.HandleSwitchCompany)
			}

			// User routes
			userRoutes := authenticated.Group("/user")
			{
				userRoutes.GET("/companies", authHandler.HandleGetUserCompanies)
			}

			// SuperAdmin routes
			superadmin := authenticated.Group("/superadmin")
			superadmin.Use(middleware.RequireSuperAdmin())
			{
				// Account management routes
				superadmin.POST("/accounts", accountHandler.HandleCreateAccount)
				superadmin.GET("/accounts", accountHandler.HandleListAccounts)
				superadmin.GET("/accounts/:id", accountHandler.HandleGetAccount)
				superadmin.PUT("/accounts/:id", accountHandler.HandleUpdateAccount)
				superadmin.PATCH("/accounts/:id/status", accountHandler.HandleUpdateAccountStatus)
				superadmin.DELETE("/accounts/:id", accountHandler.HandleDeleteAccount)
			}

			// Admin routes
			admin := authenticated.Group("/admin")
			admin.Use(middleware.RequireAdmin())
			{
				// Company management routes
				admin.POST("/companies", companyHandler.HandleCreateCompany)
				admin.GET("/companies", companyHandler.HandleListCompanies)
				admin.GET("/companies/:id", companyHandler.HandleGetCompany)
				admin.PUT("/companies/:id", companyHandler.HandleUpdateCompany)
				admin.PATCH("/companies/:id/status", companyHandler.HandleUpdateCompanyStatus)
				admin.DELETE("/companies/:id", companyHandler.HandleDeleteCompany)

				// User management routes
				admin.POST("/users", userHandler.HandleCreateUser)
				admin.GET("/users", userHandler.HandleListUsers)
				admin.GET("/users/:id", userHandler.HandleGetUser)
				admin.PUT("/users/:id", userHandler.HandleUpdateUser)
				admin.PATCH("/users/:id/status", userHandler.HandleUpdateUserStatus)
				admin.DELETE("/users/:id", userHandler.HandleDeleteUser)

				// User-Company linking routes
				admin.POST("/users/:id/companies", userHandler.HandleLinkUserToCompany)
				admin.DELETE("/users/:id/companies/:company_id", userHandler.HandleUnlinkUserFromCompany)
			}

			// Certificate management routes (separate group to avoid route conflicts)
			certificates := authenticated.Group("/admin/certificates")
			certificates.Use(middleware.RequireAdmin())
			{
				certificates.POST("/company/:company_id", certHandler.HandleUploadCertificate)
				certificates.GET("/company/:company_id/active", certHandler.HandleGetActiveCertificate)
				certificates.GET("/company/:company_id", certHandler.HandleGetCompanyCertificates)
				certificates.DELETE("/:id", certHandler.HandleDeleteCertificate)
			}

			// NFe routes (requires company context)
			nfes := authenticated.Group("/nfes")
			nfes.Use(middleware.RequireCompanyContext())
			{
				nfes.POST("", nfeHandler.HandleCreateNFe)
				nfes.GET("", nfeHandler.HandleListNFes)
				nfes.GET("/:id", nfeHandler.HandleGetNFe)
				nfes.POST("/:id/authorize", nfeHandler.HandleAuthorizeNFe)
				nfes.POST("/:id/cancel", nfeHandler.HandleCancelNFe)
				nfes.GET("/:id/xml", nfeHandler.HandleDownloadXML)
			}

			// Customer routes (requires company context)
			customers := authenticated.Group("/clientes")
			customers.Use(middleware.RequireCompanyContext())
			{
				customers.POST("", customerHandler.CreateCustomer)
				customers.GET("", customerHandler.ListCustomers)
				customers.GET("/search", customerHandler.SearchCustomers)
				customers.GET("/:id", customerHandler.GetCustomer)
				customers.PUT("/:id", customerHandler.UpdateCustomer)
				customers.DELETE("/:id", customerHandler.DeleteCustomer)
			}

			// Product routes (requires company context)
			products := authenticated.Group("/produtos")
			products.Use(middleware.RequireCompanyContext())
			{
				products.POST("", productHandler.CreateProduct)
				products.GET("", productHandler.ListProducts)
				products.GET("/search", productHandler.SearchProducts)
				products.GET("/:id", productHandler.GetProduct)
				products.PUT("/:id", productHandler.UpdateProduct)
				products.DELETE("/:id", productHandler.DeleteProduct)
			}

			// Carrier routes (requires company context)
			carriers := authenticated.Group("/transportadoras")
			carriers.Use(middleware.RequireCompanyContext())
			{
				carriers.POST("", carrierHandler.CreateCarrier)
				carriers.GET("", carrierHandler.ListCarriers)
				carriers.GET("/search", carrierHandler.SearchCarriers)
				carriers.GET("/:id", carrierHandler.GetCarrier)
				carriers.PUT("/:id", carrierHandler.UpdateCarrier)
				carriers.DELETE("/:id", carrierHandler.DeleteCarrier)
			}
		}
	}

	return router
}

