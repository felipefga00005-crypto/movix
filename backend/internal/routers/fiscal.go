package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/handlers"
	"github.com/movix/backend/internal/middleware"
	"github.com/movix/backend/internal/services"
)

// FiscalRoutes configura as rotas fiscais
func FiscalRoutes(router *gin.Engine, fiscalHandler *handlers.FiscalHandler, authService *services.AuthService) {
	// Grupo de rotas fiscais com autenticação
	fiscal := router.Group("/api/fiscal")
	fiscal.Use(middleware.AuthMiddleware(authService))
	{
		// NFCe
		nfce := fiscal.Group("/nfce")
		{
			nfce.POST("/emitir", fiscalHandler.EmitirNFCe)
			nfce.POST("/cancelar", fiscalHandler.CancelarNFCe)
			nfce.GET("/status/:chave", fiscalHandler.ConsultarStatusNFCe)
			nfce.GET("/vendas-pendentes", fiscalHandler.GetVendasParaNFCe)
			nfce.POST("/processar-lote", fiscalHandler.ProcessarLoteNFCe)
		}

		// NFe
		nfe := fiscal.Group("/nfe")
		{
			nfe.POST("/emitir", fiscalHandler.EmitirNFe)
			nfe.POST("/cancelar", func(c *gin.Context) {
				c.JSON(501, gin.H{"error": "Cancelamento de NFe não implementado ainda"})
			})
			nfe.GET("/status/:chave", func(c *gin.Context) {
				c.JSON(501, gin.H{"error": "Consulta de NFe não implementada ainda"})
			})
		}

		// CTe (futuro)
		cte := fiscal.Group("/cte")
		{
			cte.POST("/emitir", func(c *gin.Context) {
				c.JSON(501, gin.H{"error": "Emissão de CTe não implementada ainda"})
			})
			cte.POST("/cancelar", func(c *gin.Context) {
				c.JSON(501, gin.H{"error": "Cancelamento de CTe não implementado ainda"})
			})
			cte.GET("/status/:chave", func(c *gin.Context) {
				c.JSON(501, gin.H{"error": "Consulta de CTe não implementada ainda"})
			})
		}

		// Gerais
		fiscal.GET("/conectividade", fiscalHandler.TestarConectividade)
		fiscal.POST("/validar-certificado", fiscalHandler.ValidarCertificado)
		fiscal.GET("/status/:chave", fiscalHandler.ConsultarStatusNFCe)
	}

	// Rotas públicas
	publicFiscal := router.Group("/api/public/fiscal")
	{
		publicFiscal.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "OK",
				"module":  "Fiscal",
				"version": "1.0.0",
				"services": gin.H{
					"nfce": "Disponível",
					"nfe":  "Parcialmente disponível",
					"cte":  "Não implementado",
				},
			})
		})
		
		publicFiscal.GET("/info", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"documentos_suportados": []gin.H{
					{
						"tipo":        "NFCe",
						"descricao":   "Nota Fiscal de Consumidor Eletrônica",
						"status":      "Implementado",
						"operacoes":   []string{"emitir", "cancelar", "consultar"},
					},
					{
						"tipo":        "NFe",
						"descricao":   "Nota Fiscal Eletrônica",
						"status":      "Parcialmente implementado",
						"operacoes":   []string{"emitir"},
					},
					{
						"tipo":        "CTe",
						"descricao":   "Conhecimento de Transporte Eletrônico",
						"status":      "Planejado",
						"operacoes":   []string{},
					},
				},
				"integracao": gin.H{
					"servico_fiscal": "C# com DFe.NET",
					"biblioteca":     "Zeus.NFe.NFCe",
					"versao":         "2025.10.09.2019",
				},
			})
		})
	}
}
