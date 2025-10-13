package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/handlers"
	"github.com/movix/backend/internal/middleware"
	"github.com/movix/backend/internal/services"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
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
		// Rotas de usuários
		SetupUserRoutes(v1)
		
		// Rotas de clientes
		SetupClienteRoutes(v1)
		
		// Rotas de produtos
		SetupProdutoRoutes(v1)
		
		// Rotas de fornecedores
		SetupFornecedorRoutes(v1)

		// Rotas de APIs externas (CEP, CNPJ, IBGE)
		SetupExternalAPIRoutes(v1, db)
	}

	return router
}

// SetupUserRoutes configura as rotas de usuários
func SetupUserRoutes(rg *gin.RouterGroup) {
	handler := handlers.NewUserHandler()
	
	usuarios := rg.Group("/usuarios")
	{
		usuarios.GET("", handler.GetAll)
		usuarios.GET("/:id", handler.GetByID)
		usuarios.POST("", handler.Create)
		usuarios.PUT("/:id", handler.Update)
		usuarios.DELETE("/:id", handler.Delete)
		usuarios.PUT("/:id/senha", handler.ChangePassword)
		usuarios.GET("/status", handler.GetByStatus)
		usuarios.GET("/perfil", handler.GetByPerfil)
		usuarios.GET("/search", handler.Search)
		usuarios.GET("/stats", handler.GetStats)
	}
}

// SetupClienteRoutes configura as rotas de clientes
func SetupClienteRoutes(rg *gin.RouterGroup) {
	handler := handlers.NewClienteHandler()
	
	clientes := rg.Group("/clientes")
	{
		clientes.GET("", handler.GetAll)
		clientes.GET("/:id", handler.GetByID)
		clientes.POST("", handler.Create)
		clientes.PUT("/:id", handler.Update)
		clientes.DELETE("/:id", handler.Delete)
		clientes.GET("/status", handler.GetByStatus)
		clientes.GET("/search", handler.Search)
		clientes.GET("/stats", handler.GetStats)
	}
}

// SetupProdutoRoutes configura as rotas de produtos
func SetupProdutoRoutes(rg *gin.RouterGroup) {
	handler := handlers.NewProdutoHandler()
	
	produtos := rg.Group("/produtos")
	{
		produtos.GET("", handler.GetAll)
		produtos.GET("/:id", handler.GetByID)
		produtos.POST("", handler.Create)
		produtos.PUT("/:id", handler.Update)
		produtos.DELETE("/:id", handler.Delete)
		produtos.GET("/status", handler.GetByStatus)
		produtos.GET("/categoria", handler.GetByCategoria)
		produtos.GET("/estoque-baixo", handler.GetEstoqueBaixo)
		produtos.GET("/search", handler.Search)
		produtos.GET("/stats", handler.GetStats)
		produtos.PUT("/:id/estoque", handler.UpdateEstoque)
	}
}

// SetupFornecedorRoutes configura as rotas de fornecedores
func SetupFornecedorRoutes(rg *gin.RouterGroup) {
	handler := handlers.NewFornecedorHandler()
	
	fornecedores := rg.Group("/fornecedores")
	{
		fornecedores.GET("", handler.GetAll)
		fornecedores.GET("/:id", handler.GetByID)
		fornecedores.POST("", handler.Create)
		fornecedores.PUT("/:id", handler.Update)
		fornecedores.DELETE("/:id", handler.Delete)
		fornecedores.GET("/status", handler.GetByStatus)
		fornecedores.GET("/categoria", handler.GetByCategoria)
		fornecedores.GET("/search", handler.Search)
		fornecedores.GET("/stats", handler.GetStats)
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

	// Rota para forçar sincronização (admin)
	rg.POST("/cache/sync", func(c *gin.Context) {
		if err := cacheService.ForceSync(); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"message": "Cache sincronizado com sucesso"})
	})
}

