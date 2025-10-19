package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/movix/backend/internal/services"
	appErrors "github.com/movix/backend/pkg/errors"
	"github.com/movix/backend/pkg/response"
)

// AuthHandler handles authentication HTTP requests
type AuthHandler struct {
	authService *services.AuthService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// HandleLogin handles user login
// @Summary User login
// @Description Authenticate user and return JWT tokens
// @Tags auth
// @Accept json
// @Produce json
// @Param request body services.LoginRequest true "Login credentials"
// @Success 200 {object} response.Response{data=services.LoginResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) HandleLogin(c *gin.Context) {
	var req services.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	loginResp, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		switch err {
		case appErrors.ErrInvalidCredentials:
			response.Unauthorized(c, "Invalid email or password")
		case appErrors.ErrUserInactive:
			response.Forbidden(c, "User account is inactive")
		case appErrors.ErrUserSuspended:
			response.Forbidden(c, "User account is suspended")
		default:
			response.InternalServerError(c, "Failed to login")
		}
		return
	}

	response.OK(c, "Login successful", loginResp)
}

// HandleRefresh handles token refresh
// @Summary Refresh access token
// @Description Generate new access token from refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body services.RefreshTokenRequest true "Refresh token"
// @Success 200 {object} response.Response{data=services.LoginResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/v1/auth/refresh [post]
func (h *AuthHandler) HandleRefresh(c *gin.Context) {
	var req services.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	loginResp, err := h.authService.RefreshToken(req.RefreshToken)
	if err != nil {
		switch err {
		case appErrors.ErrInvalidToken, appErrors.ErrExpiredToken:
			response.Unauthorized(c, "Invalid or expired refresh token")
		case appErrors.ErrUserNotFound:
			response.NotFound(c, "User not found")
		case appErrors.ErrUserInactive:
			response.Forbidden(c, "User account is inactive")
		default:
			response.InternalServerError(c, "Failed to refresh token")
		}
		return
	}

	response.OK(c, "Token refreshed successfully", loginResp)
}

// HandleSwitchCompany handles company context switching
// @Summary Switch company context
// @Description Switch user's current company context and get new JWT
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body services.SwitchCompanyRequest true "Company ID"
// @Success 200 {object} response.Response{data=services.LoginResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/auth/switch-company [post]
func (h *AuthHandler) HandleSwitchCompany(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userIDStr, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.BadRequest(c, "Invalid user ID", nil)
		return
	}

	var req services.SwitchCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	loginResp, err := h.authService.SwitchCompany(userID, req.CompanyID)
	if err != nil {
		switch err {
		case appErrors.ErrUserNotFound:
			response.NotFound(c, "User not found")
		case appErrors.ErrNoAccessToCompany:
			response.Forbidden(c, "You don't have access to this company")
		default:
			response.InternalServerError(c, "Failed to switch company")
		}
		return
	}

	response.OK(c, "Company switched successfully", loginResp)
}

// HandleGetUserCompanies returns all companies for the authenticated user
// @Summary Get user companies
// @Description Get all companies linked to the authenticated user
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]models.UserCompany}
// @Failure 401 {object} response.Response
// @Router /api/v1/user/companies [get]
func (h *AuthHandler) HandleGetUserCompanies(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userIDStr, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.BadRequest(c, "Invalid user ID", nil)
		return
	}

	companies, err := h.authService.GetUserCompanies(userID)
	if err != nil {
		response.InternalServerError(c, "Failed to get user companies")
		return
	}

	response.OK(c, "Companies retrieved successfully", companies)
}

