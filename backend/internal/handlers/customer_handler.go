package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
)

// CustomerHandler handles HTTP requests for customers
type CustomerHandler struct {
	service *services.CustomerService
}

// NewCustomerHandler creates a new customer handler
func NewCustomerHandler(service *services.CustomerService) *CustomerHandler {
	return &CustomerHandler{service: service}
}

// CreateCustomer handles POST /clientes
func (h *CustomerHandler) CreateCustomer(c *gin.Context) {
	var customer models.Customer
	
	if err := c.ShouldBindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Get company ID from context (set by auth middleware)
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	customer.CompanyID = companyID.(uuid.UUID)
	
	if err := h.service.CriarCliente(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, customer)
}

// GetCustomer handles GET /clientes/:id
func (h *CustomerHandler) GetCustomer(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	customer, err := h.service.ObterCliente(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cliente não encontrado"})
		return
	}
	
	c.JSON(http.StatusOK, customer)
}

// ListCustomers handles GET /clientes
func (h *CustomerHandler) ListCustomers(c *gin.Context) {
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	activeOnly := c.DefaultQuery("active", "true") == "true"
	
	customers, err := h.service.ListarClientes(companyID.(uuid.UUID), activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, customers)
}

// UpdateCustomer handles PUT /clientes/:id
func (h *CustomerHandler) UpdateCustomer(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	var customer models.Customer
	if err := c.ShouldBindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	customer.ID = id
	
	// Get company ID from context
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	customer.CompanyID = companyID.(uuid.UUID)
	
	if err := h.service.AtualizarCliente(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, customer)
}

// DeleteCustomer handles DELETE /clientes/:id
func (h *CustomerHandler) DeleteCustomer(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	if err := h.service.DeletarCliente(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Cliente deletado com sucesso"})
}

// SearchCustomers handles GET /clientes/search
func (h *CustomerHandler) SearchCustomers(c *gin.Context) {
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "company_id não encontrado no contexto"})
		return
	}
	
	term := c.Query("q")
	limit := 50 // Default limit
	
	customers, err := h.service.PesquisarClientes(companyID.(uuid.UUID), term, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, customers)
}

