package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
)

// ProductHandler handles HTTP requests for products
type ProductHandler struct {
	service *services.ProductService
}

// NewProductHandler creates a new product handler
func NewProductHandler(service *services.ProductService) *ProductHandler {
	return &ProductHandler{service: service}
}

// CreateProduct handles POST /produtos
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var product models.Product
	
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Get company ID from context (set by auth middleware)
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	product.CompanyID = companyID.(uuid.UUID)
	
	if err := h.service.CriarProduto(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, product)
}

// GetProduct handles GET /produtos/:id
func (h *ProductHandler) GetProduct(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	product, err := h.service.ObterProduto(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Produto não encontrado"})
		return
	}
	
	c.JSON(http.StatusOK, product)
}

// ListProducts handles GET /produtos
func (h *ProductHandler) ListProducts(c *gin.Context) {
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	activeOnly := c.DefaultQuery("active", "true") == "true"
	
	products, err := h.service.ListarProdutos(companyID.(uuid.UUID), activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, products)
}

// UpdateProduct handles PUT /produtos/:id
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	product.ID = id
	
	// Get company ID from context
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	product.CompanyID = companyID.(uuid.UUID)
	
	if err := h.service.AtualizarProduto(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, product)
}

// DeleteProduct handles DELETE /produtos/:id
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	if err := h.service.DeletarProduto(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Produto deletado com sucesso"})
}

// SearchProducts handles GET /produtos/search
func (h *ProductHandler) SearchProducts(c *gin.Context) {
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	term := c.Query("q")
	limit := 50 // Default limit
	
	products, err := h.service.PesquisarProdutos(companyID.(uuid.UUID), term, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, products)
}

