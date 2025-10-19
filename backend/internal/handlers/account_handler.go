package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
	appErrors "github.com/movix/backend/pkg/errors"
	"github.com/movix/backend/pkg/response"
)

// AccountHandler handles account HTTP requests
type AccountHandler struct {
	accountService *services.AccountService
}

// NewAccountHandler creates a new account handler
func NewAccountHandler(accountService *services.AccountService) *AccountHandler {
	return &AccountHandler{
		accountService: accountService,
	}
}

// HandleCreateAccount handles account creation
// @Summary Create account
// @Description Create a new account with first admin user (SuperAdmin only)
// @Tags superadmin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body services.CreateAccountRequest true "Account data"
// @Success 201 {object} response.Response{data=services.AccountResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/superadmin/accounts [post]
func (h *AccountHandler) HandleCreateAccount(c *gin.Context) {
	var req services.CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	account, err := h.accountService.CreateAccount(req)
	if err != nil {
		switch err {
		case appErrors.ErrAlreadyExists:
			response.Conflict(c, "Account with this document or email already exists")
		default:
			response.InternalServerError(c, "Failed to create account")
		}
		return
	}

	response.Created(c, "Account created successfully", account)
}

// HandleGetAccount handles getting an account by ID
// @Summary Get account
// @Description Get account details by ID (SuperAdmin only)
// @Tags superadmin
// @Produce json
// @Security BearerAuth
// @Param id path string true "Account ID"
// @Success 200 {object} response.Response{data=services.AccountResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/superadmin/accounts/{id} [get]
func (h *AccountHandler) HandleGetAccount(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid account ID", nil)
		return
	}

	account, err := h.accountService.GetAccountByID(id)
	if err != nil {
		switch err {
		case appErrors.ErrAccountNotFound:
			response.NotFound(c, "Account not found")
		default:
			response.InternalServerError(c, "Failed to get account")
		}
		return
	}

	response.OK(c, "Account retrieved successfully", account)
}

// HandleListAccounts handles listing accounts
// @Summary List accounts
// @Description List all accounts with pagination (SuperAdmin only)
// @Tags superadmin
// @Produce json
// @Security BearerAuth
// @Param status query string false "Filter by status (active, suspended, cancelled)"
// @Param page query int false "Page number" default(1)
// @Param per_page query int false "Items per page" default(10)
// @Success 200 {object} response.Response{data=[]services.AccountResponse}
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/superadmin/accounts [get]
func (h *AccountHandler) HandleListAccounts(c *gin.Context) {
	// Get pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))

	// Validate pagination
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}

	// Get status filter
	var status *models.AccountStatus
	statusStr := c.Query("status")
	if statusStr != "" {
		s := models.AccountStatus(statusStr)
		status = &s
	}

	accounts, total, err := h.accountService.ListAccounts(status, page, perPage)
	if err != nil {
		response.InternalServerError(c, "Failed to list accounts")
		return
	}

	meta := response.CalculateMeta(page, perPage, total)
	response.SuccessWithMeta(c, 200, "Accounts retrieved successfully", accounts, meta)
}

// HandleUpdateAccount handles updating account limits
// @Summary Update account limits
// @Description Update account limits (SuperAdmin only)
// @Tags superadmin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Account ID"
// @Param request body services.UpdateAccountLimitsRequest true "Account limits"
// @Success 200 {object} response.Response{data=services.AccountResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/superadmin/accounts/{id} [put]
func (h *AccountHandler) HandleUpdateAccount(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid account ID", nil)
		return
	}

	var req services.UpdateAccountLimitsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	account, err := h.accountService.UpdateAccountLimits(id, req)
	if err != nil {
		switch err {
		case appErrors.ErrAccountNotFound:
			response.NotFound(c, "Account not found")
		default:
			response.InternalServerError(c, "Failed to update account")
		}
		return
	}

	response.OK(c, "Account updated successfully", account)
}

// HandleUpdateAccountStatus handles updating account status
// @Summary Update account status
// @Description Update account status (SuperAdmin only)
// @Tags superadmin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Account ID"
// @Param request body object{status=string} true "Account status"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/superadmin/accounts/{id}/status [patch]
func (h *AccountHandler) HandleUpdateAccountStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid account ID", nil)
		return
	}

	var req struct {
		Status models.AccountStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	err = h.accountService.UpdateAccountStatus(id, req.Status)
	if err != nil {
		switch err {
		case appErrors.ErrAccountNotFound:
			response.NotFound(c, "Account not found")
		default:
			response.InternalServerError(c, "Failed to update account status")
		}
		return
	}

	response.OK(c, "Account status updated successfully", nil)
}

// HandleDeleteAccount handles deleting an account
// @Summary Delete account
// @Description Soft delete an account (SuperAdmin only)
// @Tags superadmin
// @Produce json
// @Security BearerAuth
// @Param id path string true "Account ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/superadmin/accounts/{id} [delete]
func (h *AccountHandler) HandleDeleteAccount(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid account ID", nil)
		return
	}

	err = h.accountService.DeleteAccount(id)
	if err != nil {
		switch err {
		case appErrors.ErrAccountNotFound:
			response.NotFound(c, "Account not found")
		default:
			response.InternalServerError(c, "Failed to delete account")
		}
		return
	}

	response.OK(c, "Account deleted successfully", nil)
}

