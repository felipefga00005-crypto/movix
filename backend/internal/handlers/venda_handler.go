package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
)

type VendaHandler struct {
	vendaService *services.VendaService
}

func NewVendaHandler(vendaService *services.VendaService) *VendaHandler {
	return &VendaHandler{
		vendaService: vendaService,
	}
}

// ============================================
// CRUD BÁSICO DE VENDAS
// ============================================

// CreateVenda cria uma nova venda
func (h *VendaHandler) CreateVenda(c *gin.Context) {
	var request models.CreateVendaRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Obter ID do usuário do contexto (middleware de auth)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	venda, err := h.vendaService.CreateVenda(userID.(uint), request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := h.vendaService.ConvertToResponse(venda)
	c.JSON(http.StatusCreated, response)
}

// GetVendas lista vendas com filtros
func (h *VendaHandler) GetVendas(c *gin.Context) {
	var filter models.VendaFilter

	// Parse query parameters
	if status := c.Query("status"); status != "" {
		filter.Status = status
	}
	if nfceStatus := c.Query("nfce_status"); nfceStatus != "" {
		filter.NFCeStatus = nfceStatus
	}
	if clienteIDStr := c.Query("cliente_id"); clienteIDStr != "" {
		if clienteID, err := strconv.ParseUint(clienteIDStr, 10, 32); err == nil {
			clienteIDUint := uint(clienteID)
			filter.ClienteID = &clienteIDUint
		}
	}
	if usuarioIDStr := c.Query("usuario_id"); usuarioIDStr != "" {
		if usuarioID, err := strconv.ParseUint(usuarioIDStr, 10, 32); err == nil {
			usuarioIDUint := uint(usuarioID)
			filter.UsuarioID = &usuarioIDUint
		}
	}
	if dataInicio := c.Query("data_inicio"); dataInicio != "" {
		if t, err := time.Parse("2006-01-02", dataInicio); err == nil {
			filter.DataInicio = &t
		}
	}
	if dataFim := c.Query("data_fim"); dataFim != "" {
		if t, err := time.Parse("2006-01-02", dataFim); err == nil {
			filter.DataFim = &t
		}
	}
	if numeroVenda := c.Query("numero_venda"); numeroVenda != "" {
		filter.NumeroVenda = numeroVenda
	}
	if nfceChave := c.Query("nfce_chave"); nfceChave != "" {
		filter.NFCeChave = nfceChave
	}
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			filter.Limit = limit
		}
	}
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil {
			filter.Offset = offset
		}
	}

	vendas, total, err := h.vendaService.GetVendas(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Converter para response
	var responses []models.VendaResponse
	for _, venda := range vendas {
		response := h.vendaService.ConvertToResponse(&venda)
		responses = append(responses, *response)
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   responses,
		"total":  total,
		"limit":  filter.Limit,
		"offset": filter.Offset,
	})
}

// GetVendaByID busca uma venda por ID
func (h *VendaHandler) GetVendaByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	venda, err := h.vendaService.GetVendaByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Venda não encontrada"})
		return
	}

	response := h.vendaService.ConvertToResponse(venda)
	c.JSON(http.StatusOK, response)
}

// UpdateVenda atualiza uma venda
func (h *VendaHandler) UpdateVenda(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var request models.UpdateVendaRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implementar atualização de venda
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Atualização de venda não implementada ainda"})
}

// DeleteVenda remove uma venda (soft delete)
func (h *VendaHandler) DeleteVenda(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// TODO: Implementar remoção de venda
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Remoção de venda não implementada ainda"})
}

// ============================================
// OPERAÇÕES ESPECÍFICAS DE VENDAS
// ============================================

// FinalizarVenda finaliza uma venda pendente
func (h *VendaHandler) FinalizarVenda(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var request models.FinalizarVendaRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	venda, err := h.vendaService.FinalizarVenda(uint(id), request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response := h.vendaService.ConvertToResponse(venda)
	c.JSON(http.StatusOK, response)
}

// CancelarVenda cancela uma venda
func (h *VendaHandler) CancelarVenda(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	venda, err := h.vendaService.CancelarVenda(uint(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response := h.vendaService.ConvertToResponse(venda)
	c.JSON(http.StatusOK, response)
}

// AdicionarItem adiciona um item à venda
func (h *VendaHandler) AdicionarItem(c *gin.Context) {
	// TODO: Implementar adição de item
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Adição de item não implementada ainda"})
}

// AtualizarItem atualiza um item da venda
func (h *VendaHandler) AtualizarItem(c *gin.Context) {
	// TODO: Implementar atualização de item
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Atualização de item não implementada ainda"})
}

// RemoverItem remove um item da venda
func (h *VendaHandler) RemoverItem(c *gin.Context) {
	// TODO: Implementar remoção de item
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Remoção de item não implementada ainda"})
}

// ============================================
// RELATÓRIOS DE VENDAS
// ============================================

// RelatorioVendasPorPeriodo gera relatório de vendas por período
func (h *VendaHandler) RelatorioVendasPorPeriodo(c *gin.Context) {
	// TODO: Implementar relatório por período
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Relatório por período não implementado ainda"})
}

// RelatorioVendasPorProduto gera relatório de vendas por produto
func (h *VendaHandler) RelatorioVendasPorProduto(c *gin.Context) {
	// TODO: Implementar relatório por produto
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Relatório por produto não implementado ainda"})
}

// RelatorioVendasPorCliente gera relatório de vendas por cliente
func (h *VendaHandler) RelatorioVendasPorCliente(c *gin.Context) {
	// TODO: Implementar relatório por cliente
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Relatório por cliente não implementado ainda"})
}

// RelatorioVendasPorVendedor gera relatório de vendas por vendedor
func (h *VendaHandler) RelatorioVendasPorVendedor(c *gin.Context) {
	// TODO: Implementar relatório por vendedor
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Relatório por vendedor não implementado ainda"})
}

// RelatorioVendasPorFormaPagamento gera relatório de vendas por forma de pagamento
func (h *VendaHandler) RelatorioVendasPorFormaPagamento(c *gin.Context) {
	// TODO: Implementar relatório por forma de pagamento
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Relatório por forma de pagamento não implementado ainda"})
}

// ============================================
// ESTATÍSTICAS DE VENDAS
// ============================================

// EstatisticasHoje retorna estatísticas de vendas do dia
func (h *VendaHandler) EstatisticasHoje(c *gin.Context) {
	// TODO: Implementar estatísticas do dia
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Estatísticas do dia não implementadas ainda"})
}

// EstatisticasMes retorna estatísticas de vendas do mês
func (h *VendaHandler) EstatisticasMes(c *gin.Context) {
	// TODO: Implementar estatísticas do mês
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Estatísticas do mês não implementadas ainda"})
}

// EstatisticasAno retorna estatísticas de vendas do ano
func (h *VendaHandler) EstatisticasAno(c *gin.Context) {
	// TODO: Implementar estatísticas do ano
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Estatísticas do ano não implementadas ainda"})
}

// DashboardVendas retorna dados para dashboard de vendas
func (h *VendaHandler) DashboardVendas(c *gin.Context) {
	// TODO: Implementar dashboard de vendas
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Dashboard de vendas não implementado ainda"})
}

// ============================================
// OPERAÇÕES FISCAIS RELACIONADAS
// ============================================

// GetVendasPendentesNFCe lista vendas que podem emitir NFCe
func (h *VendaHandler) GetVendasPendentesNFCe(c *gin.Context) {
	vendas, err := h.vendaService.GetVendasParaNFCe()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Converter para response
	var responses []models.VendaResponse
	for _, venda := range vendas {
		response := h.vendaService.ConvertToResponse(&venda)
		responses = append(responses, *response)
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  responses,
		"total": len(responses),
	})
}

// EmitirNFCeVenda emite NFCe para uma venda específica
func (h *VendaHandler) EmitirNFCeVenda(c *gin.Context) {
	// TODO: Implementar emissão de NFCe via handler de venda
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Emissão de NFCe via venda não implementada ainda"})
}

// CancelarNFCeVenda cancela NFCe de uma venda
func (h *VendaHandler) CancelarNFCeVenda(c *gin.Context) {
	// TODO: Implementar cancelamento de NFCe via handler de venda
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Cancelamento de NFCe via venda não implementado ainda"})
}

// GetStatusFiscalVenda retorna status fiscal de uma venda
func (h *VendaHandler) GetStatusFiscalVenda(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	venda, err := h.vendaService.GetVendaByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Venda não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"venda_id":         venda.ID,
		"numero_venda":     venda.NumeroVenda,
		"status":           venda.Status,
		"nfce_status":      venda.NFCeStatus,
		"nfce_numero":      venda.NFCeNumero,
		"nfce_chave":       venda.NFCeChave,
		"nfce_protocolo":   venda.NFCeProtocolo,
		"nfce_data_aut":    venda.NFCeDataAut,
		"can_emitir_nfce":  venda.CanEmitirNFCe(),
		"can_cancelar_nfce": venda.CanCancelarNFCe(),
	})
}
