package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/handlers"
	"github.com/movix/backend/internal/middleware"
)

// SetupFiscalRoutes configura as rotas fiscais
func SetupFiscalRoutes(router *gin.Engine, fiscalHandler *handlers.FiscalHandler) {
	// Grupo de rotas fiscais com autenticação
	fiscal := router.Group("/api/fiscal")
	fiscal.Use(middleware.AuthMiddleware())
	{
		// ============================================
		// ROTAS NFCe
		// ============================================
		nfce := fiscal.Group("/nfce")
		{
			// Emitir NFCe
			nfce.POST("/emitir", fiscalHandler.EmitirNFCe)
			
			// Cancelar NFCe
			nfce.POST("/cancelar", fiscalHandler.CancelarNFCe)
			
			// Consultar status de NFCe
			nfce.GET("/status/:chave", fiscalHandler.ConsultarStatusNFCe)
			
			// Listar vendas que podem emitir NFCe
			nfce.GET("/vendas-pendentes", fiscalHandler.GetVendasParaNFCe)
			
			// Processar lote de NFCes
			nfce.POST("/processar-lote", fiscalHandler.ProcessarLoteNFCe)
		}

		// ============================================
		// ROTAS NFe
		// ============================================
		nfe := fiscal.Group("/nfe")
		{
			// Emitir NFe
			nfe.POST("/emitir", fiscalHandler.EmitirNFe)
			
			// Cancelar NFe (implementação futura)
			nfe.POST("/cancelar", func(c *gin.Context) {
				c.JSON(501, gin.H{"error": "Cancelamento de NFe não implementado ainda"})
			})
			
			// Consultar status de NFe (implementação futura)
			nfe.GET("/status/:chave", func(c *gin.Context) {
				c.JSON(501, gin.H{"error": "Consulta de NFe não implementada ainda"})
			})
		}

		// ============================================
		// ROTAS CTe (FUTURO)
		// ============================================
		cte := fiscal.Group("/cte")
		{
			// Emitir CTe (implementação futura)
			cte.POST("/emitir", func(c *gin.Context) {
				c.JSON(501, gin.H{"error": "Emissão de CTe não implementada ainda"})
			})
			
			// Cancelar CTe (implementação futura)
			cte.POST("/cancelar", func(c *gin.Context) {
				c.JSON(501, gin.H{"error": "Cancelamento de CTe não implementado ainda"})
			})
			
			// Consultar status de CTe (implementação futura)
			cte.GET("/status/:chave", func(c *gin.Context) {
				c.JSON(501, gin.H{"error": "Consulta de CTe não implementada ainda"})
			})
		}

		// ============================================
		// ROTAS GERAIS
		// ============================================
		
		// Testar conectividade com serviço fiscal C#
		fiscal.GET("/conectividade", fiscalHandler.TestarConectividade)
		
		// Validar certificado digital
		fiscal.POST("/validar-certificado", fiscalHandler.ValidarCertificado)
		
		// Consultar status de qualquer documento por chave
		fiscal.GET("/status/:chave", fiscalHandler.ConsultarStatusNFCe) // Por enquanto usa NFCe
	}

	// ============================================
	// ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
	// ============================================
	publicFiscal := router.Group("/api/public/fiscal")
	{
		// Health check do módulo fiscal
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
		
		// Informações sobre documentos fiscais suportados
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
