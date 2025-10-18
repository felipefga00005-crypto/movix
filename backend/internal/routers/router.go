package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/handlers"
	"github.com/movix/backend/internal/middleware"
	"github.com/movix/backend/internal/services"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB, jwtSecret string) *gin.Engine {
	router := gin.Default()

	// Middlewares globais
	router.Use(middleware.CORS())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Movix API is running",
		})
	})

	// API v1
	v1 := router.Group("/api/v1")
	{
		// Rotas de autenticação (públicas)
		SetupAuthRoutes(v1, db, jwtSecret)

		// Cria o serviço de autenticação para o middleware
		authService := services.NewAuthService(db, jwtSecret)

		// Rotas protegidas
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(authService))
		{
			// Rotas de usuários
			SetupUserRoutes(protected, db)

			// Rotas de clientes
			SetupClienteRoutes(protected, db)

			// Rotas de produtos
			SetupProdutoRoutes(protected, db)

			// Rotas de fornecedores
			SetupFornecedorRoutes(protected, db)

			// Rotas de APIs externas (CEP, CNPJ, IBGE)
			SetupExternalAPIRoutes(protected, db)
		}
	}

	return router
}

// SetupAuthRoutes configura as rotas de autenticação
func SetupAuthRoutes(rg *gin.RouterGroup, db *gorm.DB, jwtSecret string) {
	authService := services.NewAuthService(db, jwtSecret)
	handler := handlers.NewAuthHandler(authService)

	auth := rg.Group("/auth")
	{
		// Rotas públicas
		auth.POST("/login", handler.Login)
		auth.POST("/register", handler.Register)
		auth.GET("/setup/status", handler.CheckSetup)
		auth.POST("/setup", handler.SetupSuperAdmin)

		// Rotas protegidas
		protected := auth.Group("")
		protected.Use(middleware.AuthMiddleware(authService))
		{
			protected.GET("/me", handler.Me)
			protected.POST("/refresh", handler.RefreshToken)
		}
	}
}

// SetupUserRoutes configura as rotas de usuários
func SetupUserRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	userService := services.NewUserService(db)
	handler := handlers.NewUserHandler(userService)

	usuarios := rg.Group("/usuarios")
	{
		// Rotas específicas DEVEM vir antes das rotas com parâmetros
		usuarios.GET("/status", handler.GetByStatus)
		usuarios.GET("/perfil", handler.GetByPerfil)
		usuarios.GET("/search", handler.Search)
		usuarios.GET("/stats", handler.GetStats)

		// Rotas gerais
		usuarios.GET("", handler.GetAll)
		usuarios.POST("", handler.Create)

		// Rotas com parâmetros DEVEM vir por último
		usuarios.GET("/:id", handler.GetByID)
		usuarios.PUT("/:id", handler.Update)
		usuarios.DELETE("/:id", handler.Delete)
		usuarios.PUT("/:id/senha", handler.ChangePassword)
	}
}

// SetupClienteRoutes configura as rotas de clientes
func SetupClienteRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	clienteService := services.NewClienteService(db)
	handler := handlers.NewClienteHandler(clienteService)

	clientes := rg.Group("/clientes")
	{
		// Rotas específicas DEVEM vir antes das rotas com parâmetros
		clientes.GET("/status", handler.GetByStatus)
		clientes.GET("/search", handler.Search)
		clientes.GET("/stats", handler.GetStats)

		// Rotas gerais
		clientes.GET("", handler.GetAll)
		clientes.POST("", handler.Create)

		// Rotas com parâmetros DEVEM vir por último
		clientes.GET("/:id", handler.GetByID)
		clientes.PUT("/:id", handler.Update)
		clientes.DELETE("/:id", handler.Delete)
	}
}

// SetupProdutoRoutes configura as rotas de produtos
func SetupProdutoRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	produtoService := services.NewProdutoService(db)
	handler := handlers.NewProdutoHandler(produtoService)

	produtos := rg.Group("/produtos")
	{
		// Rotas específicas DEVEM vir antes das rotas com parâmetros
		produtos.GET("/status", handler.GetByStatus)
		produtos.GET("/categoria", handler.GetByCategoria)
		produtos.GET("/estoque-baixo", handler.GetEstoqueBaixo)
		produtos.GET("/sem-estoque", handler.GetSemEstoque)
		produtos.GET("/search", handler.Search)
		produtos.GET("/stats", handler.GetStats)
		produtos.GET("/categorias", handler.GetCategorias)
		produtos.GET("/marcas", handler.GetMarcas)
		produtos.GET("/fornecedores", handler.GetFornecedores)
		produtos.POST("/bulk/activate", handler.BulkActivate)
		produtos.POST("/bulk/deactivate", handler.BulkDeactivate)
		produtos.POST("/bulk/delete", handler.BulkDelete)

		// Rotas gerais
		produtos.GET("", handler.GetAll)
		produtos.POST("", handler.Create)

		// Rotas com parâmetros DEVEM vir por último
		produtos.GET("/:id", handler.GetByID)
		produtos.PUT("/:id", handler.Update)
		produtos.DELETE("/:id", handler.Delete)
		produtos.PUT("/:id/estoque", handler.UpdateEstoque)
		produtos.PUT("/:id/destaque", handler.SetDestaque)
		produtos.PUT("/:id/promocao", handler.SetPromocao)
	}
}

// SetupFornecedorRoutes configura as rotas de fornecedores
func SetupFornecedorRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	fornecedorService := services.NewFornecedorService(db)
	handler := handlers.NewFornecedorHandler(fornecedorService)

	fornecedores := rg.Group("/fornecedores")
	{
		// Rotas específicas DEVEM vir antes das rotas com parâmetros
		fornecedores.GET("/status", handler.GetByStatus)
		fornecedores.GET("/categoria", handler.GetByCategoria)
		fornecedores.GET("/search", handler.Search)
		fornecedores.GET("/stats", handler.GetStats)
		fornecedores.GET("/categorias", handler.GetCategorias)
		fornecedores.POST("/bulk/activate", handler.BulkActivate)
		fornecedores.POST("/bulk/deactivate", handler.BulkDeactivate)
		fornecedores.POST("/bulk/block", handler.BulkBlock)
		fornecedores.POST("/bulk/delete", handler.BulkDelete)

		// Rotas gerais
		fornecedores.GET("", handler.GetAll)
		fornecedores.POST("", handler.Create)

		// Rotas com parâmetros DEVEM vir por último
		fornecedores.GET("/:id", handler.GetByID)
		fornecedores.PUT("/:id", handler.Update)
		fornecedores.DELETE("/:id", handler.Delete)
	}
}

// SetupExternalAPIRoutes configura as rotas de APIs externas
func SetupExternalAPIRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	cacheService := services.NewCacheService(db)
	externalAPIService := services.NewExternalAPIService(cacheService)
	handler := handlers.NewExternalAPIHandler(externalAPIService)

	// Rotas de CEP
	rg.GET("/cep/:cep", handler.BuscarCEP)

	// Rotas de CNPJ
	rg.GET("/cnpj/:cnpj", handler.BuscarCNPJ)

	// Rotas do IBGE (com cache inteligente)
	rg.GET("/estados", handler.ListarEstados)
	rg.GET("/estados/:uf/cidades", handler.ListarCidadesPorEstado)

	// Rotas combinadas
	rg.GET("/localizacao/:cep", handler.BuscarLocalizacaoCompleta)
	rg.GET("/formulario/dados", handler.BuscarDadosFormulario)
}

