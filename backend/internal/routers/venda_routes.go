package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/handlers"
	"github.com/movix/backend/internal/middleware"
)

// SetupVendaRoutes configura as rotas de vendas
func SetupVendaRoutes(router *gin.Engine, vendaHandler *handlers.VendaHandler) {
	// Grupo de rotas de vendas com autenticação
	vendas := router.Group("/api/vendas")
	vendas.Use(middleware.AuthMiddleware())
	{
		// ============================================
		// CRUD BÁSICO DE VENDAS
		// ============================================
		vendas.POST("/", vendaHandler.CreateVenda)
		vendas.GET("/", vendaHandler.GetVendas)
		vendas.GET("/:id", vendaHandler.GetVendaByID)
		vendas.PUT("/:id", vendaHandler.UpdateVenda)
		vendas.DELETE("/:id", vendaHandler.DeleteVenda)
		
		// ============================================
		// OPERAÇÕES ESPECÍFICAS DE VENDAS
		// ============================================
		vendas.POST("/:id/finalizar", vendaHandler.FinalizarVenda)
		vendas.POST("/:id/cancelar", vendaHandler.CancelarVenda)
		vendas.POST("/:id/adicionar-item", vendaHandler.AdicionarItem)
		vendas.PUT("/:id/item/:item_id", vendaHandler.AtualizarItem)
		vendas.DELETE("/:id/item/:item_id", vendaHandler.RemoverItem)
		
		// ============================================
		// RELATÓRIOS DE VENDAS
		// ============================================
		relatorios := vendas.Group("/relatorios")
		{
			relatorios.GET("/periodo", vendaHandler.RelatorioVendasPorPeriodo)
			relatorios.GET("/produtos", vendaHandler.RelatorioVendasPorProduto)
			relatorios.GET("/clientes", vendaHandler.RelatorioVendasPorCliente)
			relatorios.GET("/vendedores", vendaHandler.RelatorioVendasPorVendedor)
			relatorios.GET("/formas-pagamento", vendaHandler.RelatorioVendasPorFormaPagamento)
		}
		
		// ============================================
		// ESTATÍSTICAS DE VENDAS
		// ============================================
		stats := vendas.Group("/stats")
		{
			stats.GET("/hoje", vendaHandler.EstatisticasHoje)
			stats.GET("/mes", vendaHandler.EstatisticasMes)
			stats.GET("/ano", vendaHandler.EstatisticasAno)
			stats.GET("/dashboard", vendaHandler.DashboardVendas)
		}
		
		// ============================================
		// OPERAÇÕES FISCAIS RELACIONADAS
		// ============================================
		fiscal := vendas.Group("/fiscal")
		{
			fiscal.GET("/pendentes-nfce", vendaHandler.GetVendasPendentesNFCe)
			fiscal.POST("/:id/emitir-nfce", vendaHandler.EmitirNFCeVenda)
			fiscal.POST("/:id/cancelar-nfce", vendaHandler.CancelarNFCeVenda)
			fiscal.GET("/:id/status-fiscal", vendaHandler.GetStatusFiscalVenda)
		}
	}
}

// SetupPDVRoutes configura rotas específicas do PDV
func SetupPDVRoutes(router *gin.Engine, pdvHandler *handlers.PDVHandler) {
	// Grupo de rotas do PDV
	pdv := router.Group("/api/pdv")
	pdv.Use(middleware.AuthMiddleware())
	{
		// ============================================
		// OPERAÇÕES DO CAIXA
		// ============================================
		caixa := pdv.Group("/caixa")
		{
			caixa.POST("/abrir", pdvHandler.AbrirCaixa)
			caixa.POST("/fechar", pdvHandler.FecharCaixa)
			caixa.GET("/status", pdvHandler.StatusCaixa)
			caixa.GET("/movimentacao", pdvHandler.MovimentacaoCaixa)
			caixa.POST("/sangria", pdvHandler.SangriaCaixa)
			caixa.POST("/suprimento", pdvHandler.SuprimentoCaixa)
		}
		
		// ============================================
		// OPERAÇÕES DE VENDA RÁPIDA
		// ============================================
		pdv.POST("/venda-rapida", pdvHandler.VendaRapida)
		pdv.POST("/venda/:id/emitir-nfce", pdvHandler.EmitirNFCeVenda)
		pdv.POST("/venda/:id/imprimir-cupom", pdvHandler.ImprimirCupom)
		
		// ============================================
		// CONSULTAS RÁPIDAS PARA PDV
		// ============================================
		busca := pdv.Group("/buscar")
		{
			busca.GET("/produtos", pdvHandler.BuscarProdutos)
			busca.GET("/produtos/codigo/:codigo", pdvHandler.BuscarProdutoPorCodigo)
			busca.GET("/clientes", pdvHandler.BuscarClientes)
			busca.GET("/clientes/cpf/:cpf", pdvHandler.BuscarClientePorCPF)
		}
		
		// ============================================
		// CONFIGURAÇÕES DO PDV
		// ============================================
		config := pdv.Group("/config")
		{
			config.GET("/formas-pagamento", pdvHandler.GetFormasPagamento)
			config.GET("/naturezas-operacao", pdvHandler.GetNaturezasOperacao)
			config.GET("/impressoras", pdvHandler.GetImpressoras)
			config.POST("/teste-impressora", pdvHandler.TesteImpressora)
		}
		
		// ============================================
		// ESTATÍSTICAS DO PDV
		// ============================================
		pdv.GET("/vendas-hoje", pdvHandler.VendasHoje)
		pdv.GET("/meta-vendas", pdvHandler.MetaVendas)
		pdv.GET("/produtos-mais-vendidos", pdvHandler.ProdutosMaisVendidos)
	}
}

// SetupItemVendaRoutes configura rotas específicas para itens de venda
func SetupItemVendaRoutes(router *gin.Engine, itemVendaHandler *handlers.ItemVendaHandler) {
	// Grupo de rotas para itens de venda
	itens := router.Group("/api/itens-venda")
	itens.Use(middleware.AuthMiddleware())
	{
		// CRUD de itens de venda
		itens.POST("/", itemVendaHandler.CreateItem)
		itens.GET("/:id", itemVendaHandler.GetItemByID)
		itens.PUT("/:id", itemVendaHandler.UpdateItem)
		itens.DELETE("/:id", itemVendaHandler.DeleteItem)
		
		// Operações específicas
		itens.POST("/:id/aplicar-desconto", itemVendaHandler.AplicarDesconto)
		itens.POST("/:id/remover-desconto", itemVendaHandler.RemoverDesconto)
		itens.GET("/:id/calcular-impostos", itemVendaHandler.CalcularImpostos)
	}
}

// ============================================
// DOCUMENTAÇÃO DAS ROTAS DE VENDAS
// ============================================

/*
ROTAS DE VENDAS IMPLEMENTADAS:

=== CRUD BÁSICO ===
POST /api/vendas/
- Cria uma nova venda
- Body: { "cliente_id": 123, "natureza_op_id": 1, "forma_pagamento": 1, "valor_pago": 100.00, "itens": [...] }

GET /api/vendas/
- Lista vendas com filtros opcionais
- Query params: status, nfce_status, cliente_id, usuario_id, data_inicio, data_fim, limit, offset

GET /api/vendas/:id
- Busca uma venda por ID com todos os relacionamentos

PUT /api/vendas/:id
- Atualiza dados básicos de uma venda pendente

DELETE /api/vendas/:id
- Remove uma venda (soft delete)

=== OPERAÇÕES ESPECÍFICAS ===
POST /api/vendas/:id/finalizar
- Finaliza uma venda pendente
- Body: { "forma_pagamento": 1, "valor_pago": 100.00 }

POST /api/vendas/:id/cancelar
- Cancela uma venda (não pode ter NFCe emitida)

POST /api/vendas/:id/adicionar-item
- Adiciona um item à venda
- Body: { "produto_id": 123, "quantidade": 2, "valor_unit": 50.00, "valor_desc": 0 }

=== RELATÓRIOS ===
GET /api/vendas/relatorios/periodo
- Relatório de vendas por período
- Query params: data_inicio, data_fim, grupo_por (dia/mes/ano)

GET /api/vendas/relatorios/produtos
- Relatório de vendas por produto
- Query params: data_inicio, data_fim, limit

GET /api/vendas/relatorios/clientes
- Relatório de vendas por cliente
- Query params: data_inicio, data_fim, limit

=== ESTATÍSTICAS ===
GET /api/vendas/stats/hoje
- Estatísticas de vendas do dia atual

GET /api/vendas/stats/mes
- Estatísticas de vendas do mês atual

GET /api/vendas/stats/dashboard
- Dados para dashboard de vendas

=== OPERAÇÕES FISCAIS ===
GET /api/vendas/fiscal/pendentes-nfce
- Lista vendas que podem emitir NFCe

POST /api/vendas/:id/emitir-nfce
- Emite NFCe para uma venda específica

POST /api/vendas/:id/cancelar-nfce
- Cancela NFCe de uma venda

=== PDV ===
POST /api/pdv/venda-rapida
- Cria e finaliza uma venda rapidamente no PDV

POST /api/pdv/caixa/abrir
- Abre o caixa do PDV

GET /api/pdv/buscar/produtos
- Busca produtos para o PDV
- Query params: q (termo de busca), limit

GET /api/pdv/config/formas-pagamento
- Lista formas de pagamento disponíveis

AUTENTICAÇÃO:
- Todas as rotas requerem autenticação via JWT
- O usuário logado é automaticamente associado às vendas criadas
*/
