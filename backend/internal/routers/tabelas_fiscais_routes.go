package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/handlers"
	"github.com/movix/backend/internal/services"
	"gorm.io/gorm"
)

// SetupTabelasFiscaisRoutes configura as rotas das tabelas fiscais
func SetupTabelasFiscaisRoutes(router *gin.RouterGroup, db *gorm.DB) {
	// Inicializar service e handler
	tabelasFiscaisService := services.NewTabelasFiscaisService(db)
	tabelasFiscaisHandler := handlers.NewTabelasFiscaisHandler(tabelasFiscaisService)

	// Grupo de rotas para tabelas fiscais
	tabelasGroup := router.Group("/tabelas-fiscais")
	{
		// ============================================
		// ROTAS DE SINCRONIZAÇÃO
		// ============================================
		syncGroup := tabelasGroup.Group("/sync")
		{
			syncGroup.POST("", tabelasFiscaisHandler.SyncTabela)           // Sincronizar tabela específica
			syncGroup.POST("/todas", tabelasFiscaisHandler.SyncTodasTabelas) // Sincronizar todas as tabelas
			syncGroup.GET("/status", tabelasFiscaisHandler.GetStatusSync)    // Status de sincronização
		}

		// ============================================
		// ROTAS NCM
		// ============================================
		ncmGroup := tabelasGroup.Group("/ncm")
		{
			ncmGroup.POST("/buscar", tabelasFiscaisHandler.BuscarNCM)    // Buscar NCMs
			ncmGroup.GET("/:codigo", tabelasFiscaisHandler.GetNCM)       // Obter NCM por código
		}

		// ============================================
		// ROTAS CFOP
		// ============================================
		cfopGroup := tabelasGroup.Group("/cfop")
		{
			cfopGroup.POST("/buscar", tabelasFiscaisHandler.BuscarCFOP)                        // Buscar CFOPs
			cfopGroup.GET("/aplicacao/:aplicacao", tabelasFiscaisHandler.GetCFOPsPorAplicacao) // CFOPs por aplicação
		}

		// ============================================
		// ROTAS CST
		// ============================================
		cstGroup := tabelasGroup.Group("/cst")
		{
			cstGroup.GET("/:tipo", tabelasFiscaisHandler.GetCSTsPorTipo) // CSTs por tipo (ICMS, IPI, PIS, COFINS)
		}

		// ============================================
		// ROTAS CSOSN
		// ============================================
		csosnGroup := tabelasGroup.Group("/csosn")
		{
			csosnGroup.GET("", tabelasFiscaisHandler.GetCSOSNs) // Todos os CSOSNs
		}

		// ============================================
		// ROTAS UNIDADES DE MEDIDA
		// ============================================
		unidadesGroup := tabelasGroup.Group("/unidades-medida")
		{
			unidadesGroup.GET("", tabelasFiscaisHandler.GetUnidadesMedida) // Todas as unidades
		}
	}

	// ============================================
	// INICIALIZAÇÃO AUTOMÁTICA
	// ============================================
	// Sincronizar tabelas básicas na inicialização (apenas se não existirem)
	go func() {
		// Aguarda um pouco para garantir que o banco está pronto
		// time.Sleep(2 * time.Second)
		
		// Sincroniza tabelas estáticas (não força se já existem)
		if err := tabelasFiscaisService.SyncCFOP(false); err != nil {
			// Log do erro, mas não interrompe a aplicação
			// logger.Error("Erro ao sincronizar CFOP na inicialização: %v", err)
		}

		if err := tabelasFiscaisService.SyncCST(false); err != nil {
			// logger.Error("Erro ao sincronizar CST na inicialização: %v", err)
		}

		if err := tabelasFiscaisService.SyncCSOSN(false); err != nil {
			// logger.Error("Erro ao sincronizar CSOSN na inicialização: %v", err)
		}

		if err := tabelasFiscaisService.SyncUnidadesMedida(false); err != nil {
			// logger.Error("Erro ao sincronizar Unidades de Medida na inicialização: %v", err)
		}

		// NCM não sincroniza automaticamente por ser muito pesado
		// Deve ser feito manualmente via endpoint
	}()
}

// ============================================
// DOCUMENTAÇÃO DAS ROTAS
// ============================================

/*
ROTAS DISPONÍVEIS:

SINCRONIZAÇÃO:
POST   /api/tabelas-fiscais/sync              - Sincronizar tabela específica
POST   /api/tabelas-fiscais/sync/todas        - Sincronizar todas as tabelas
GET    /api/tabelas-fiscais/sync/status       - Status de sincronização

NCM:
POST   /api/tabelas-fiscais/ncm/buscar        - Buscar NCMs
GET    /api/tabelas-fiscais/ncm/:codigo       - Obter NCM por código

CFOP:
POST   /api/tabelas-fiscais/cfop/buscar       - Buscar CFOPs
GET    /api/tabelas-fiscais/cfop/aplicacao/:aplicacao - CFOPs por aplicação

CST:
GET    /api/tabelas-fiscais/cst/:tipo         - CSTs por tipo

CSOSN:
GET    /api/tabelas-fiscais/csosn             - Todos os CSOSNs

UNIDADES DE MEDIDA:
GET    /api/tabelas-fiscais/unidades-medida   - Todas as unidades

EXEMPLOS DE USO:

1. Sincronizar todas as tabelas:
POST /api/tabelas-fiscais/sync/todas

2. Sincronizar apenas NCM:
POST /api/tabelas-fiscais/sync
{
  "tabela": "ncm",
  "forcar_sync": false
}

3. Buscar NCM por descrição:
POST /api/tabelas-fiscais/ncm/buscar
{
  "descricao": "açúcar",
  "limit": 10
}

4. Buscar CFOP de saída:
POST /api/tabelas-fiscais/cfop/buscar
{
  "aplicacao": "Saída",
  "limit": 20
}

5. Obter CSTs de ICMS:
GET /api/tabelas-fiscais/cst/ICMS

6. Obter todos os CSOSNs:
GET /api/tabelas-fiscais/csosn

7. Verificar status de sincronização:
GET /api/tabelas-fiscais/sync/status

RESPOSTA TÍPICA DO STATUS:
{
  "status": {
    "ncm": {
      "sincronizado": true,
      "ultima_sync": "2024-01-15T10:30:00Z",
      "total_registros": 12000,
      "fonte_dados": "https://portalunico.siscomex.gov.br/...",
      "dias_desde_sync": 2
    },
    "cfop": {
      "sincronizado": true,
      "ultima_sync": "2024-01-15T10:25:00Z",
      "total_registros": 500,
      "fonte_dados": "dados_estaticos",
      "dias_desde_sync": 2
    }
  }
}
*/
