package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
)

type FornecedorHandler struct {
	service *services.FornecedorService
}

func NewFornecedorHandler(service *services.FornecedorService) *FornecedorHandler {
	return &FornecedorHandler{
		service: service,
	}
}

func (h *FornecedorHandler) GetAll(c *gin.Context) {
	fornecedores, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, fornecedores)
}

func (h *FornecedorHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	fornecedor, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, fornecedor)
}

func (h *FornecedorHandler) Create(c *gin.Context) {
	var req models.CreateFornecedorRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	fornecedor, err := h.service.Create(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, fornecedor)
}

func (h *FornecedorHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	var req models.UpdateFornecedorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	fornecedor, err := h.service.Update(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, fornecedor)
}

func (h *FornecedorHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	if err := h.service.Delete(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusNoContent, nil)
}

func (h *FornecedorHandler) GetByStatus(c *gin.Context) {
	status := c.Query("status")
	if status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status é obrigatório"})
		return
	}
	
	fornecedores, err := h.service.GetByStatus(status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, fornecedores)
}

func (h *FornecedorHandler) GetByCategoria(c *gin.Context) {
	categoria := c.Query("categoria")
	if categoria == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Categoria é obrigatória"})
		return
	}
	
	fornecedores, err := h.service.GetByCategoria(categoria)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, fornecedores)
}

func (h *FornecedorHandler) Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query é obrigatória"})
		return
	}
	
	fornecedores, err := h.service.Search(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, fornecedores)
}

func (h *FornecedorHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, stats)
}

// GetCategorias retorna lista de categorias únicas
func (h *FornecedorHandler) GetCategorias(c *gin.Context) {
	categorias, err := h.service.GetCategorias()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, categorias)
}

