package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
)

type UserHandler struct {
	service *services.UserService
}

func NewUserHandler() *UserHandler {
	return &UserHandler{
		service: services.NewUserService(),
	}
}

// GetAll godoc
// @Summary Lista todos os usuários
// @Tags usuarios
// @Produce json
// @Success 200 {array} models.User
// @Router /usuarios [get]
func (h *UserHandler) GetAll(c *gin.Context) {
	users, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, users)
}

// GetByID godoc
// @Summary Busca usuário por ID
// @Tags usuarios
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.User
// @Router /usuarios/{id} [get]
func (h *UserHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	user, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

// Create godoc
// @Summary Cria um novo usuário
// @Tags usuarios
// @Accept json
// @Produce json
// @Param user body models.CreateUserRequest true "User data"
// @Success 201 {object} models.User
// @Router /usuarios [post]
func (h *UserHandler) Create(c *gin.Context) {
	var req models.CreateUserRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	user, err := h.service.Create(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, user)
}

// Update godoc
// @Summary Atualiza um usuário
// @Tags usuarios
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param user body models.UpdateUserRequest true "User data"
// @Success 200 {object} models.User
// @Router /usuarios/{id} [put]
func (h *UserHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	user, err := h.service.Update(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

// Delete godoc
// @Summary Deleta um usuário
// @Tags usuarios
// @Param id path int true "User ID"
// @Success 204
// @Router /usuarios/{id} [delete]
func (h *UserHandler) Delete(c *gin.Context) {
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

// ChangePassword godoc
// @Summary Altera a senha do usuário
// @Tags usuarios
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param password body models.ChangePasswordRequest true "Password data"
// @Success 200
// @Router /usuarios/{id}/senha [put]
func (h *UserHandler) ChangePassword(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	
	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := h.service.ChangePassword(uint(id), &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Senha alterada com sucesso"})
}

// GetByStatus godoc
// @Summary Lista usuários por status
// @Tags usuarios
// @Produce json
// @Param status query string true "Status"
// @Success 200 {array} models.User
// @Router /usuarios/status [get]
func (h *UserHandler) GetByStatus(c *gin.Context) {
	status := c.Query("status")
	if status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status é obrigatório"})
		return
	}
	
	users, err := h.service.GetByStatus(status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, users)
}

// GetByPerfil godoc
// @Summary Lista usuários por perfil
// @Tags usuarios
// @Produce json
// @Param perfil query string true "Perfil"
// @Success 200 {array} models.User
// @Router /usuarios/perfil [get]
func (h *UserHandler) GetByPerfil(c *gin.Context) {
	perfil := c.Query("perfil")
	if perfil == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Perfil é obrigatório"})
		return
	}
	
	users, err := h.service.GetByPerfil(perfil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, users)
}

// Search godoc
// @Summary Busca usuários por nome ou email
// @Tags usuarios
// @Produce json
// @Param q query string true "Query"
// @Success 200 {array} models.User
// @Router /usuarios/search [get]
func (h *UserHandler) Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query é obrigatória"})
		return
	}
	
	users, err := h.service.Search(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, users)
}

// GetStats godoc
// @Summary Retorna estatísticas dos usuários
// @Tags usuarios
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /usuarios/stats [get]
func (h *UserHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, stats)
}

