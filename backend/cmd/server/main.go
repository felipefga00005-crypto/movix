package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/routers"
)

func main() {
	// Carrega configurações
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Conecta ao banco de dados
	if err := database.Connect(cfg); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate dos models
	if err := database.AutoMigrate(
		// Modelos existentes
		&models.User{},
		&models.Cliente{},
		&models.ClienteCampoPersonalizado{},
		&models.Fornecedor{},
		&models.FornecedorCampoPersonalizado{},
		&models.Produto{}, // Já estendido com campos fiscais
		&models.Estado{},
		&models.Regiao{},
		&models.Cidade{},
		&models.CacheMetadata{},

		// Novos modelos fiscais
		&models.Empresa{},
		&models.NaturezaOperacao{},
		&models.NCM{},
		&models.CFOP{},
		&models.CST{},
		&models.CSOSN{},
		&models.CEST{},
		&models.UnidadeMedida{},
		&models.TabelaFiscalMetadata{},
		&models.Venda{},
		&models.ItemVenda{},
	); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Configura o Gin
	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Configura o router com JWT secret
	router := routers.SetupRouter(database.DB, cfg.JWT.Secret)

	// Inicia o servidor
	port := ":" + cfg.Server.Port
	log.Printf("🚀 Server starting on port %s", port)
	if err := router.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

