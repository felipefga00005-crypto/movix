package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/handlers"
	"github.com/movix/backend/internal/middleware"
)

// VendaRoutes configura as rotas de vendas
func VendaRoutes(router *gin.Engine, vendaHandler *handlers.VendaHandler) {
	vendas := router.Group("/api/vendas")
	vendas.Use(middleware.AuthMiddleware())
	{
		// CRUD básico
		vendas.POST("/", vendaHandler.CreateVenda)
		vendas.GET("/", vendaHandler.GetVendas)
		vendas.GET("/:id", vendaHandler.GetVendaByID)
		vendas.PUT("/:id", vendaHandler.UpdateVenda)
		vendas.DELETE("/:id", vendaHandler.DeleteVenda)
		
		// Operações específicas
		vendas.POST("/:id/finalizar", vendaHandler.FinalizarVenda)
		vendas.POST("/:id/cancelar", vendaHandler.CancelarVenda)
		vendas.POST("/:id/adicionar-item", vendaHandler.AdicionarItem)
		vendas.PUT("/:id/item/:item_id", vendaHandler.AtualizarItem)
		vendas.DELETE("/:id/item/:item_id", vendaHandler.RemoverItem)
		
		// Relatórios
		relatorios := vendas.Group("/relatorios")
		{
			relatorios.GET("/periodo", vendaHandler.RelatorioVendasPorPeriodo)
			relatorios.GET("/produtos", vendaHandler.RelatorioVendasPorProduto)
			relatorios.GET("/clientes", vendaHandler.RelatorioVendasPorCliente)
			relatorios.GET("/vendedores", vendaHandler.RelatorioVendasPorVendedor)
			relatorios.GET("/formas-pagamento", vendaHandler.RelatorioVendasPorFormaPagamento)
		}
		
		// Estatísticas
		stats := vendas.Group("/stats")
		{
			stats.GET("/hoje", vendaHandler.EstatisticasHoje)
			stats.GET("/mes", vendaHandler.EstatisticasMes)
			stats.GET("/ano", vendaHandler.EstatisticasAno)
			stats.GET("/dashboard", vendaHandler.DashboardVendas)
		}
		
		// Operações fiscais
		fiscal := vendas.Group("/fiscal")
		{
			fiscal.GET("/pendentes-nfce", vendaHandler.GetVendasPendentesNFCe)
			fiscal.POST("/:id/emitir-nfce", vendaHandler.EmitirNFCeVenda)
			fiscal.POST("/:id/cancelar-nfce", vendaHandler.CancelarNFCeVenda)
			fiscal.GET("/:id/status-fiscal", vendaHandler.GetStatusFiscalVenda)
		}
	}
}

// PDVRoutes configura rotas do PDV
func PDVRoutes(router *gin.Engine, pdvHandler *handlers.PDVHandler) {
	pdv := router.Group("/api/pdv")
	pdv.Use(middleware.AuthMiddleware())
	{
		// Operações do caixa
		caixa := pdv.Group("/caixa")
		{
			caixa.POST("/abrir", pdvHandler.AbrirCaixa)
			caixa.POST("/fechar", pdvHandler.FecharCaixa)
			caixa.GET("/status", pdvHandler.StatusCaixa)
			caixa.GET("/movimentacao", pdvHandler.MovimentacaoCaixa)
			caixa.POST("/sangria", pdvHandler.SangriaCaixa)
			caixa.POST("/suprimento", pdvHandler.SuprimentoCaixa)
		}
		
		// Venda rápida
		pdv.POST("/venda-rapida", pdvHandler.VendaRapida)
		pdv.POST("/venda/:id/emitir-nfce", pdvHandler.EmitirNFCeVenda)
		pdv.POST("/venda/:id/imprimir-cupom", pdvHandler.ImprimirCupom)
		
		// Consultas rápidas
		busca := pdv.Group("/buscar")
		{
			busca.GET("/produtos", pdvHandler.BuscarProdutos)
			busca.GET("/produtos/codigo/:codigo", pdvHandler.BuscarProdutoPorCodigo)
			busca.GET("/clientes", pdvHandler.BuscarClientes)
			busca.GET("/clientes/cpf/:cpf", pdvHandler.BuscarClientePorCPF)
		}
		
		// Configurações
		config := pdv.Group("/config")
		{
			config.GET("/formas-pagamento", pdvHandler.GetFormasPagamento)
			config.GET("/naturezas-operacao", pdvHandler.GetNaturezasOperacao)
			config.GET("/impressoras", pdvHandler.GetImpressoras)
			config.POST("/teste-impressora", pdvHandler.TesteImpressora)
		}
		
		// Estatísticas
		pdv.GET("/vendas-hoje", pdvHandler.VendasHoje)
		pdv.GET("/meta-vendas", pdvHandler.MetaVendas)
		pdv.GET("/produtos-mais-vendidos", pdvHandler.ProdutosMaisVendidos)
	}
}
