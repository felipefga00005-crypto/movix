package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/services"
)

type ExternalAPIHandler struct {
	externalAPIService *services.ExternalAPIService
}

func NewExternalAPIHandler(externalAPIService *services.ExternalAPIService) *ExternalAPIHandler {
	return &ExternalAPIHandler{
		externalAPIService: externalAPIService,
	}
}

// ============================================
// HANDLERS DE CEP
// ============================================

// @Summary Buscar endereço por CEP
// @Description Busca informações de endereço através do CEP usando múltiplos provedores
// @Tags CEP
// @Accept json
// @Produce json
// @Param cep path string true "CEP (8 dígitos, com ou sem formatação)"
// @Success 200 {object} services.Endereco
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/cep/{cep} [get]
func (h *ExternalAPIHandler) BuscarCEP(c *gin.Context) {
	cep := c.Param("cep")
	
	if cep == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "CEP é obrigatório",
		})
		return
	}

	endereco, err := h.externalAPIService.BuscarCEP(cep)
	if err != nil {
		if strings.Contains(err.Error(), "8 dígitos") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		
		if strings.Contains(err.Error(), "não encontrado") {
			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erro interno ao buscar CEP",
		})
		return
	}

	c.JSON(http.StatusOK, endereco)
}

// ============================================
// HANDLERS DE CNPJ
// ============================================

// @Summary Buscar empresa por CNPJ
// @Description Busca informações completas de uma empresa através do CNPJ
// @Tags CNPJ
// @Accept json
// @Produce json
// @Param cnpj path string true "CNPJ (14 dígitos, com ou sem formatação)"
// @Success 200 {object} services.Empresa
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/cnpj/{cnpj} [get]
func (h *ExternalAPIHandler) BuscarCNPJ(c *gin.Context) {
	cnpj := c.Param("cnpj")
	
	if cnpj == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "CNPJ é obrigatório",
		})
		return
	}

	empresa, err := h.externalAPIService.BuscarCNPJ(cnpj)
	if err != nil {
		if strings.Contains(err.Error(), "14 dígitos") || strings.Contains(err.Error(), "inválido") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		
		if strings.Contains(err.Error(), "não encontrado") {
			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erro interno ao buscar CNPJ",
		})
		return
	}

	c.JSON(http.StatusOK, empresa)
}

// ============================================
// HANDLERS DO IBGE
// ============================================

// @Summary Listar todos os estados
// @Description Retorna lista completa de estados brasileiros
// @Tags IBGE
// @Accept json
// @Produce json
// @Success 200 {array} services.Estado
// @Failure 500 {object} map[string]string
// @Router /api/v1/estados [get]
func (h *ExternalAPIHandler) ListarEstados(c *gin.Context) {
	estados, err := h.externalAPIService.BuscarEstados()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erro interno ao buscar estados",
		})
		return
	}

	c.JSON(http.StatusOK, estados)
}

// @Summary Listar cidades por estado
// @Description Retorna lista de cidades de um estado específico
// @Tags IBGE
// @Accept json
// @Produce json
// @Param uf path string true "Sigla do estado (UF)"
// @Success 200 {array} services.Cidade
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/estados/{uf}/cidades [get]
func (h *ExternalAPIHandler) ListarCidadesPorEstado(c *gin.Context) {
	uf := c.Param("uf")
	
	if uf == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "UF é obrigatório",
		})
		return
	}

	if len(uf) != 2 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "UF deve conter exatamente 2 caracteres",
		})
		return
	}

	cidades, err := h.externalAPIService.BuscarCidadesPorEstado(uf)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erro interno ao buscar cidades",
		})
		return
	}

	c.JSON(http.StatusOK, cidades)
}

// ============================================
// HANDLERS COMBINADOS
// ============================================

// @Summary Validar e buscar endereço completo
// @Description Busca CEP e valida cidade/estado através do IBGE
// @Tags Localização
// @Accept json
// @Produce json
// @Param cep path string true "CEP (8 dígitos)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/localizacao/{cep} [get]
func (h *ExternalAPIHandler) BuscarLocalizacaoCompleta(c *gin.Context) {
	cep := c.Param("cep")
	
	if cep == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "CEP é obrigatório",
		})
		return
	}

	// Busca endereço por CEP
	endereco, err := h.externalAPIService.BuscarCEP(cep)
	if err != nil {
		if strings.Contains(err.Error(), "8 dígitos") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		
		if strings.Contains(err.Error(), "não encontrado") {
			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erro interno ao buscar CEP",
		})
		return
	}

	// Valida cidade no estado
	cidadeValida := true
	cidades, err := h.externalAPIService.BuscarCidadesPorEstado(endereco.Estado)
	if err == nil {
		cidadeValida = false
		for _, cidade := range cidades {
			if strings.EqualFold(cidade.Nome, endereco.Cidade) {
				cidadeValida = true
				break
			}
		}
	}

	response := map[string]interface{}{
		"endereco":       endereco,
		"cidade_valida":  cidadeValida,
		"validado_ibge":  err == nil,
	}

	c.JSON(http.StatusOK, response)
}

// @Summary Buscar dados completos para formulário
// @Description Endpoint combinado para buscar CEP + Estados + Cidades
// @Tags Formulário
// @Accept json
// @Produce json
// @Param cep query string false "CEP para buscar endereço"
// @Param uf query string false "UF para buscar cidades"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /api/v1/formulario/dados [get]
func (h *ExternalAPIHandler) BuscarDadosFormulario(c *gin.Context) {
	cep := c.Query("cep")
	uf := c.Query("uf")

	response := make(map[string]interface{})

	// Sempre busca estados
	estados, err := h.externalAPIService.BuscarEstados()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erro ao buscar estados",
		})
		return
	}
	response["estados"] = estados

	// Busca endereço se CEP fornecido
	if cep != "" {
		endereco, err := h.externalAPIService.BuscarCEP(cep)
		if err == nil {
			response["endereco"] = endereco
			// Se encontrou endereço, busca cidades do estado automaticamente
			if endereco.Estado != "" {
				cidades, err := h.externalAPIService.BuscarCidadesPorEstado(endereco.Estado)
				if err == nil {
					response["cidades"] = cidades
				}
			}
		} else {
			response["erro_cep"] = err.Error()
		}
	}

	// Busca cidades se UF fornecido (e não foi buscado pelo CEP)
	if uf != "" && response["cidades"] == nil {
		cidades, err := h.externalAPIService.BuscarCidadesPorEstado(uf)
		if err == nil {
			response["cidades"] = cidades
		} else {
			response["erro_cidades"] = err.Error()
		}
	}

	c.JSON(http.StatusOK, response)
}
