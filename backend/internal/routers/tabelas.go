package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/handlers"
	"github.com/movix/backend/internal/services"
	"gorm.io/gorm"
)

// TabelasRoutes configura as rotas das tabelas fiscais
func TabelasRoutes(router *gin.RouterGroup, db *gorm.DB) {
	// Inicializar service e handler
	tabelasFiscaisService := services.NewTabelasFiscaisService(db)
	tabelasFiscaisHandler := handlers.NewTabelasFiscaisHandler(tabelasFiscaisService)

	// Grupo de rotas para tabelas fiscais
	tabelasGroup := router.Group("/tabelas-fiscais")
	{
		// Sincronização
		syncGroup := tabelasGroup.Group("/sync")
		{
			syncGroup.POST("", tabelasFiscaisHandler.SyncTabela)
			syncGroup.POST("/todas", tabelasFiscaisHandler.SyncTodasTabelas)
			syncGroup.GET("/status", tabelasFiscaisHandler.GetStatusSync)
		}

		// NCM
		ncmGroup := tabelasGroup.Group("/ncm")
		{
			ncmGroup.POST("/buscar", tabelasFiscaisHandler.BuscarNCM)
			ncmGroup.GET("/:codigo", tabelasFiscaisHandler.GetNCM)
		}

		// CFOP
		cfopGroup := tabelasGroup.Group("/cfop")
		{
			cfopGroup.POST("/buscar", tabelasFiscaisHandler.BuscarCFOP)
			cfopGroup.GET("/aplicacao/:aplicacao", tabelasFiscaisHandler.GetCFOPsPorAplicacao)
		}

		// CST
		cstGroup := tabelasGroup.Group("/cst")
		{
			cstGroup.POST("/buscar", tabelasFiscaisHandler.BuscarCST)
			cstGroup.GET("/tipo/:tipo", tabelasFiscaisHandler.GetCSTsPorTipo)
		}

		// CSOSN
		csosnGroup := tabelasGroup.Group("/csosn")
		{
			csosnGroup.POST("/buscar", tabelasFiscaisHandler.BuscarCSOSN)
			csosnGroup.GET("/todos", tabelasFiscaisHandler.GetTodosCSOSN)
		}

		// CEST
		cestGroup := tabelasGroup.Group("/cest")
		{
			cestGroup.POST("/buscar", tabelasFiscaisHandler.BuscarCEST)
			cestGroup.GET("/:codigo", tabelasFiscaisHandler.GetCEST)
			cestGroup.GET("/ncm/:ncm", tabelasFiscaisHandler.GetCESTPorNCM)
		}

		// Unidades de Medida
		unidadeGroup := tabelasGroup.Group("/unidades")
		{
			unidadeGroup.POST("/buscar", tabelasFiscaisHandler.BuscarUnidadeMedida)
			unidadeGroup.GET("/todas", tabelasFiscaisHandler.GetTodasUnidades)
		}

		// Metadados
		metaGroup := tabelasGroup.Group("/metadata")
		{
			metaGroup.GET("/", tabelasFiscaisHandler.GetMetadata)
			metaGroup.POST("/atualizar", tabelasFiscaisHandler.AtualizarMetadata)
		}

		// Validações
		validacaoGroup := tabelasGroup.Group("/validar")
		{
			validacaoGroup.POST("/ncm", tabelasFiscaisHandler.ValidarNCM)
			validacaoGroup.POST("/cfop", tabelasFiscaisHandler.ValidarCFOP)
			validacaoGroup.POST("/cst", tabelasFiscaisHandler.ValidarCST)
			validacaoGroup.POST("/csosn", tabelasFiscaisHandler.ValidarCSOSN)
			validacaoGroup.POST("/cest", tabelasFiscaisHandler.ValidarCEST)
		}

		// Consultas combinadas
		consultaGroup := tabelasGroup.Group("/consulta")
		{
			consultaGroup.POST("/produto-fiscal", tabelasFiscaisHandler.ConsultaDadosFiscaisProduto)
			consultaGroup.POST("/operacao-fiscal", tabelasFiscaisHandler.ConsultaDadosOperacaoFiscal)
		}

		// Relatórios
		relatorioGroup := tabelasGroup.Group("/relatorios")
		{
			relatorioGroup.GET("/resumo-tabelas", tabelasFiscaisHandler.RelatorioResumoTabelas)
			relatorioGroup.GET("/inconsistencias", tabelasFiscaisHandler.RelatorioInconsistencias)
		}

		// Utilitários
		utilGroup := tabelasGroup.Group("/util")
		{
			utilGroup.POST("/calcular-digito-ncm", tabelasFiscaisHandler.CalcularDigitoNCM)
			utilGroup.POST("/formatar-cfop", tabelasFiscaisHandler.FormatarCFOP)
			utilGroup.GET("/tipos-cst", tabelasFiscaisHandler.GetTiposCST)
		}

		// Importação/Exportação
		ioGroup := tabelasGroup.Group("/io")
		{
			ioGroup.POST("/importar-csv", tabelasFiscaisHandler.ImportarCSV)
			ioGroup.GET("/exportar-csv/:tabela", tabelasFiscaisHandler.ExportarCSV)
			ioGroup.POST("/backup", tabelasFiscaisHandler.BackupTabelas)
			ioGroup.POST("/restore", tabelasFiscaisHandler.RestoreTabelas)
		}
	}
}
