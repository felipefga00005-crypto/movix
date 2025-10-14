package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
)

type AuthHandler struct {
	service *services.AuthService
}

func NewAuthHandler(service *services.AuthService) *AuthHandler {
	return &AuthHandler{
		service: service,
	}
}

// Login godoc
// @Summary Autentica um usuário
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body models.LoginRequest true "Login credentials"
// @Success 200 {object} models.LoginResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	response, err := h.service.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, response)
}

// Register godoc
// @Summary Registra um novo usuário (apenas durante setup)
// @Tags auth
// @Accept json
// @Produce json
// @Param user body models.CreateUserRequest true "User data"
// @Success 201 {object} models.User
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.CreateUserRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	user, err := h.service.Register(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, user)
}

// CheckSetup godoc
// @Summary Verifica se o sistema precisa de setup inicial
// @Tags auth
// @Produce json
// @Success 200 {object} models.SetupStatusResponse
// @Router /auth/setup/status [get]
func (h *AuthHandler) CheckSetup(c *gin.Context) {
	setupRequired, err := h.service.CheckSetupRequired()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, models.SetupStatusResponse{
		SetupRequired: setupRequired,
	})
}

// SetupSuperAdmin godoc
// @Summary Cria o primeiro usuário super admin
// @Tags auth
// @Accept json
// @Produce json
// @Param setup body models.SetupRequest true "Setup data"
// @Success 201 {object} models.LoginResponse
// @Router /auth/setup [post]
func (h *AuthHandler) SetupSuperAdmin(c *gin.Context) {
	var req models.SetupRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	response, err := h.service.SetupSuperAdmin(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, response)
}

// Me godoc
// @Summary Retorna os dados do usuário autenticado
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.User
// @Router /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	// O usuário é injetado pelo middleware de autenticação
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "não autenticado"})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

// RefreshToken godoc
// @Summary Atualiza o token JWT
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]string
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "não autenticado"})
		return
	}
	
	userModel := user.(*models.User)
	token, err := h.service.RefreshToken(userModel.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"token": token})
}

