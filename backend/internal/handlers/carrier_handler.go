package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
)

// CarrierHandler handles HTTP requests for carriers
type CarrierHandler struct {
	service *services.CarrierService
}

// NewCarrierHandler creates a new carrier handler
func NewCarrierHandler(service *services.CarrierService) *CarrierHandler {
	return &CarrierHandler{service: service}
}

// CreateCarrier handles POST /transportadoras
func (h *CarrierHandler) CreateCarrier(c *gin.Context) {
	var carrier models.Carrier
	
	if err := c.ShouldBindJSON(&carrier); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Get company ID from context (set by auth middleware)
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	carrier.CompanyID = companyID.(uuid.UUID)
	
	if err := h.service.CriarTransportadora(&carrier); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, carrier)
}

// GetCarrier handles GET /transportadoras/:id
func (h *CarrierHandler) GetCarrier(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	carrier, err := h.service.ObterTransportadora(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transportadora não encontrada"})
		return
	}
	
	c.JSON(http.StatusOK, carrier)
}

// ListCarriers handles GET /transportadoras
func (h *CarrierHandler) ListCarriers(c *gin.Context) {
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	activeOnly := c.DefaultQuery("active", "true") == "true"
	
	carriers, err := h.service.ListarTransportadoras(companyID.(uuid.UUID), activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, carriers)
}

// UpdateCarrier handles PUT /transportadoras/:id
func (h *CarrierHandler) UpdateCarrier(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	var carrier models.Carrier
	if err := c.ShouldBindJSON(&carrier); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	carrier.ID = id
	
	// Get company ID from context
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	carrier.CompanyID = companyID.(uuid.UUID)
	
	if err := h.service.AtualizarTransportadora(&carrier); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, carrier)
}

// DeleteCarrier handles DELETE /transportadoras/:id
func (h *CarrierHandler) DeleteCarrier(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	if err := h.service.DeletarTransportadora(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Transportadora deletada com sucesso"})
}

// SearchCarriers handles GET /transportadoras/search
func (h *CarrierHandler) SearchCarriers(c *gin.Context) {
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	term := c.Query("q")
	limit := 50 // Default limit
	
	carriers, err := h.service.PesquisarTransportadoras(companyID.(uuid.UUID), term, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, carriers)
}

