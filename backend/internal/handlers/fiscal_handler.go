package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
	"github.com/movix/backend/internal/services/fiscal"
	"gorm.io/gorm"
)

type FiscalHandler struct {
	nfceService  *fiscal.NFCeService
	nfeService   *fiscal.NFeService
	cteService   *fiscal.CTeService
	vendaService *services.VendaService
	db           *gorm.DB
}

func NewFiscalHandler(
	nfceService *fiscal.NFCeService,
	nfeService *fiscal.NFeService,
	cteService *fiscal.CTeService,
	vendaService *services.VendaService,
	db *gorm.DB,
) *FiscalHandler {
	return &FiscalHandler{
		nfceService:  nfceService,
		nfeService:   nfeService,
		cteService:   cteService,
		vendaService: vendaService,
		db:           db,
	}
}

// ============================================
// ENDPOINTS NFCe
// ============================================

// EmitirNFCe emite uma NFCe para uma venda
func (h *FiscalHandler) EmitirNFCe(c *gin.Context) {
	var request models.EmitirNFCeRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar venda
	venda, err := h.vendaService.GetVendaByID(request.VendaID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Venda não encontrada"})
		return
	}

	// Verificar se pode emitir NFCe
	if !venda.CanEmitirNFCe() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Venda não pode emitir NFCe"})
		return
	}

	// Emitir NFCe usando o service específico
	nfceResponse, err := h.nfceService.Emitir(venda)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Atualizar venda com dados da NFCe se foi autorizada
	if nfceResponse.Sucesso {
		nfceData := map[string]interface{}{
			"chave_acesso":         nfceResponse.ChaveAcesso,
			"numero":               nfceResponse.Numero,
			"protocolo_autorizacao": nfceResponse.ProtocoloAut,
			"data_autorizacao":     nfceResponse.DataAutorizacao,
			"status":               "autorizada",
		}

		if err := h.vendaService.UpdateVendaNFCe(request.VendaID, nfceData); err != nil {
			// Log do erro, mas não falha a operação
		}
	}

	c.JSON(http.StatusOK, nfceResponse)
}

// CancelarNFCe cancela uma NFCe
func (h *FiscalHandler) CancelarNFCe(c *gin.Context) {
	var request models.CancelarNFCeRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar venda
	venda, err := h.vendaService.GetVendaByID(request.VendaID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Venda não encontrada"})
		return
	}

	// Verificar se pode cancelar NFCe
	if !venda.CanCancelarNFCe() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "NFCe não pode ser cancelada"})
		return
	}

	// Buscar empresa
	empresa, err := h.nfceService.GetEmpresaPrincipal()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Empresa não configurada"})
		return
	}

	// Cancelar NFCe usando service específico
	nfceResponse, err := h.nfceService.Cancelar(*venda.NFCeChave, request.Justificativa, empresa)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Atualizar status da NFCe na venda se foi cancelada
	if nfceResponse.Sucesso {
		nfceData := map[string]interface{}{
			"status": "cancelada",
		}

		if err := h.vendaService.UpdateVendaNFCe(request.VendaID, nfceData); err != nil {
			// Log do erro, mas não falha a operação
		}
	}

	c.JSON(http.StatusOK, nfceResponse)
}

// ConsultarStatusNFCe consulta o status de uma NFCe
func (h *FiscalHandler) ConsultarStatusNFCe(c *gin.Context) {
	chaveAcesso := c.Param("chave")
	if chaveAcesso == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Chave de acesso é obrigatória"})
		return
	}

	// Buscar empresa
	empresa, err := h.nfceService.GetEmpresaPrincipal()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Empresa não configurada"})
		return
	}

	// Consultar status usando service específico
	status, err := h.nfceService.ConsultarStatus(chaveAcesso, empresa)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, status)
}

// ============================================
// ENDPOINTS NFe
// ============================================

// EmitirNFe emite uma NFe para uma venda
func (h *FiscalHandler) EmitirNFe(c *gin.Context) {
	var request models.EmitirNFCeRequest // Reutiliza o mesmo request por enquanto
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar venda
	venda, err := h.vendaService.GetVendaByID(request.VendaID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Venda não encontrada"})
		return
	}

	// Verificar se pode emitir NFe (NFe precisa de cliente)
	if venda.Cliente == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "NFe requer um cliente (destinatário)"})
		return
	}

	if !venda.IsFinalizada() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Venda deve estar finalizada"})
		return
	}

	// Emitir NFe usando service específico
	nfeResponse, err := h.nfeService.Emitir(venda)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, nfeResponse)
}

// ============================================
// ENDPOINTS GERAIS
// ============================================

// TestarConectividade testa a conectividade com o serviço fiscal
func (h *FiscalHandler) TestarConectividade(c *gin.Context) {
	err := h.nfceService.TestarConectividade()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"conectado": false,
			"erro":      err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"conectado": true,
		"mensagem":  "Serviço fiscal disponível",
	})
}

// ValidarCertificado valida um certificado digital
func (h *FiscalHandler) ValidarCertificado(c *gin.Context) {
	var request struct {
		CertificadoBase64 string `json:"certificado_base64" binding:"required"`
		Senha             string `json:"senha" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resultado, err := h.nfceService.ValidarCertificado(request.CertificadoBase64, request.Senha)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resultado)
}

// GetVendasParaNFCe lista vendas que podem emitir NFCe
func (h *FiscalHandler) GetVendasParaNFCe(c *gin.Context) {
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

// ProcessarLoteNFCe processa um lote de NFCes pendentes
func (h *FiscalHandler) ProcessarLoteNFCe(c *gin.Context) {
	// Buscar vendas pendentes
	vendas, err := h.vendaService.GetVendasParaNFCe()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(vendas) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"mensagem": "Nenhuma venda pendente para emissão de NFCe",
			"total":    0,
		})
		return
	}

	// Buscar empresa
	empresa, err := h.nfceService.GetEmpresaPrincipal()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Empresa não configurada"})
		return
	}

	// Processar lote usando service específico
	loteResponse, err := h.nfceService.ProcessarLoteNFCe(vendas, empresa)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Atualizar vendas que foram processadas com sucesso
	for _, resultado := range loteResponse.Resultados {
		if resultado.Sucesso {
			nfceData := map[string]interface{}{
				"chave_acesso": resultado.ChaveAcesso,
				"numero":       resultado.Numero,
				"status":       "autorizada",
			}
			h.vendaService.UpdateVendaNFCe(resultado.VendaID, nfceData)
		}
	}

	c.JSON(http.StatusOK, loteResponse)
}
