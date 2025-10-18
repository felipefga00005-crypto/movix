package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
)

type TabelasFiscaisHandler struct {
	service *services.TabelasFiscaisService
}

func NewTabelasFiscaisHandler(service *services.TabelasFiscaisService) *TabelasFiscaisHandler {
	return &TabelasFiscaisHandler{
		service: service,
	}
}

// ============================================
// ENDPOINTS DE SINCRONIZAÇÃO
// ============================================

// SyncTabela sincroniza uma tabela fiscal específica
// @Summary Sincronizar tabela fiscal
// @Description Sincroniza uma tabela fiscal específica (ncm, cfop, cst, csosn, unidades_medida)
// @Tags Tabelas Fiscais
// @Accept json
// @Produce json
// @Param request body models.SyncTabelaFiscalRequest true "Dados da sincronização"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/tabelas-fiscais/sync [post]
func (h *TabelasFiscaisHandler) SyncTabela(c *gin.Context) {
	var request models.SyncTabelaFiscalRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var err error
	switch request.Tabela {
	case "ncm":
		err = h.service.SyncNCM(request.ForcarSync)
	case "cfop":
		err = h.service.SyncCFOP(request.ForcarSync)
	case "cst":
		err = h.service.SyncCST(request.ForcarSync)
	case "csosn":
		err = h.service.SyncCSOSN(request.ForcarSync)
	case "unidades_medida":
		err = h.service.SyncUnidadesMedida(request.ForcarSync)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tabela inválida"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tabela sincronizada com sucesso",
		"tabela":  request.Tabela,
	})
}

// SyncTodasTabelas sincroniza todas as tabelas fiscais
// @Summary Sincronizar todas as tabelas fiscais
// @Description Sincroniza todas as tabelas fiscais de uma vez
// @Tags Tabelas Fiscais
// @Accept json
// @Produce json
// @Param forcar_sync query bool false "Forçar sincronização mesmo se já atualizada"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/tabelas-fiscais/sync-todas [post]
func (h *TabelasFiscaisHandler) SyncTodasTabelas(c *gin.Context) {
	forcarSync := c.Query("forcar_sync") == "true"

	if err := h.service.SyncTodasTabelas(forcarSync); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Todas as tabelas foram sincronizadas com sucesso",
	})
}

// GetStatusSync retorna status de sincronização das tabelas
// @Summary Status de sincronização
// @Description Retorna o status de sincronização de todas as tabelas fiscais
// @Tags Tabelas Fiscais
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/tabelas-fiscais/status [get]
func (h *TabelasFiscaisHandler) GetStatusSync(c *gin.Context) {
	status, err := h.service.GetStatusSync()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": status,
	})
}

// ============================================
// ENDPOINTS DE CONSULTA NCM
// ============================================

// BuscarNCM busca NCMs por código ou descrição
// @Summary Buscar NCM
// @Description Busca NCMs por código ou descrição
// @Tags NCM
// @Accept json
// @Produce json
// @Param request body models.BuscarNCMRequest true "Critérios de busca"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/tabelas-fiscais/ncm/buscar [post]
func (h *TabelasFiscaisHandler) BuscarNCM(c *gin.Context) {
	var request models.BuscarNCMRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ncms, err := h.service.BuscarNCM(request.Codigo, request.Descricao, request.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  ncms,
		"total": len(ncms),
	})
}

// GetNCM retorna NCM por código
// @Summary Obter NCM por código
// @Description Retorna um NCM específico pelo código
// @Tags NCM
// @Produce json
// @Param codigo path string true "Código NCM (8 dígitos)"
// @Success 200 {object} models.NCM
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/tabelas-fiscais/ncm/{codigo} [get]
func (h *TabelasFiscaisHandler) GetNCM(c *gin.Context) {
	codigo := c.Param("codigo")
	
	ncms, err := h.service.BuscarNCM(codigo, "", 1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(ncms) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "NCM não encontrado"})
		return
	}

	c.JSON(http.StatusOK, ncms[0])
}

// ============================================
// ENDPOINTS DE CONSULTA CFOP
// ============================================

// BuscarCFOP busca CFOPs por critérios
// @Summary Buscar CFOP
// @Description Busca CFOPs por código, descrição ou aplicação
// @Tags CFOP
// @Accept json
// @Produce json
// @Param request body models.BuscarCFOPRequest true "Critérios de busca"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/tabelas-fiscais/cfop/buscar [post]
func (h *TabelasFiscaisHandler) BuscarCFOP(c *gin.Context) {
	var request models.BuscarCFOPRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cfops, err := h.service.BuscarCFOP(request.Codigo, request.Descricao, request.Aplicacao, request.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  cfops,
		"total": len(cfops),
	})
}

// GetCFOPsPorAplicacao retorna CFOPs por aplicação
// @Summary Obter CFOPs por aplicação
// @Description Retorna CFOPs filtrados por aplicação (Entrada, Saída, Ambos)
// @Tags CFOP
// @Produce json
// @Param aplicacao path string true "Aplicação (Entrada, Saída, Ambos)"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/tabelas-fiscais/cfop/aplicacao/{aplicacao} [get]
func (h *TabelasFiscaisHandler) GetCFOPsPorAplicacao(c *gin.Context) {
	aplicacao := c.Param("aplicacao")
	
	cfops, err := h.service.BuscarCFOP("", "", aplicacao, 100)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      cfops,
		"total":     len(cfops),
		"aplicacao": aplicacao,
	})
}

// ============================================
// ENDPOINTS DE CONSULTA CST
// ============================================

// GetCSTsPorTipo retorna CSTs por tipo
// @Summary Obter CSTs por tipo
// @Description Retorna CSTs filtrados por tipo (ICMS, IPI, PIS, COFINS)
// @Tags CST
// @Produce json
// @Param tipo path string true "Tipo (ICMS, IPI, PIS, COFINS)"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/tabelas-fiscais/cst/{tipo} [get]
func (h *TabelasFiscaisHandler) GetCSTsPorTipo(c *gin.Context) {
	tipo := c.Param("tipo")
	
	csts, err := h.service.GetCSTPorTipo(tipo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  csts,
		"total": len(csts),
		"tipo":  tipo,
	})
}

// ============================================
// ENDPOINTS DE CONSULTA CSOSN
// ============================================

// GetCSOSNs retorna todos os CSOSNs ativos
// @Summary Obter CSOSNs
// @Description Retorna todos os CSOSNs (Simples Nacional) ativos
// @Tags CSOSN
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/tabelas-fiscais/csosn [get]
func (h *TabelasFiscaisHandler) GetCSOSNs(c *gin.Context) {
	csosns, err := h.service.GetCSOSNAtivos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  csosns,
		"total": len(csosns),
	})
}

// ============================================
// ENDPOINTS DE CONSULTA UNIDADES DE MEDIDA
// ============================================

// GetUnidadesMedida retorna todas as unidades de medida
// @Summary Obter unidades de medida
// @Description Retorna todas as unidades de medida ativas
// @Tags Unidades de Medida
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/tabelas-fiscais/unidades-medida [get]
func (h *TabelasFiscaisHandler) GetUnidadesMedida(c *gin.Context) {
	unidades, err := h.service.GetUnidadesMedida()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  unidades,
		"total": len(unidades),
	})
}
