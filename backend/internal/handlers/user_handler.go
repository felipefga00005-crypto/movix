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

// UserHandler handles user HTTP requests
type UserHandler struct {
	userService *services.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// HandleCreateUser handles user creation
// @Summary Create user
// @Description Create a new user (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body services.CreateUserRequest true "User data"
// @Success 201 {object} response.Response{data=services.UserResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/admin/users [post]
func (h *UserHandler) HandleCreateUser(c *gin.Context) {
	var req services.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	user, err := h.userService.CreateUser(req)
	if err != nil {
		switch err {
		case appErrors.ErrAccountNotFound:
			response.NotFound(c, "Account not found")
		case appErrors.ErrAccountSuspended:
			response.Forbidden(c, "Account is suspended")
		case appErrors.ErrMaxUsersReached:
			response.Forbidden(c, "Maximum number of users reached for this account")
		case appErrors.ErrAlreadyExists:
			response.Conflict(c, "User with this email already exists")
		default:
			response.InternalServerError(c, "Failed to create user")
		}
		return
	}

	response.Created(c, "User created successfully", user)
}

// HandleGetUser handles getting a user by ID
// @Summary Get user
// @Description Get user details by ID (Admin only)
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 200 {object} response.Response{data=services.UserResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/users/{id} [get]
func (h *UserHandler) HandleGetUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid user ID", nil)
		return
	}

	user, err := h.userService.GetUserByID(id)
	if err != nil {
		switch err {
		case appErrors.ErrUserNotFound:
			response.NotFound(c, "User not found")
		default:
			response.InternalServerError(c, "Failed to get user")
		}
		return
	}

	response.OK(c, "User retrieved successfully", user)
}

// HandleListUsers handles listing users
// @Summary List users
// @Description List all users with pagination (Admin only)
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param account_id query string false "Filter by account ID"
// @Param page query int false "Page number" default(1)
// @Param per_page query int false "Items per page" default(10)
// @Success 200 {object} response.Response{data=[]services.UserResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/admin/users [get]
func (h *UserHandler) HandleListUsers(c *gin.Context) {
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

	// Get account_id filter (optional)
	var accountID *uuid.UUID
	accountIDStr := c.Query("account_id")
	if accountIDStr != "" {
		id, err := uuid.Parse(accountIDStr)
		if err != nil {
			response.BadRequest(c, "Invalid account_id", nil)
			return
		}
		accountID = &id
	}

	users, total, err := h.userService.ListUsers(accountID, page, perPage)
	if err != nil {
		response.InternalServerError(c, "Failed to list users")
		return
	}

	meta := response.CalculateMeta(page, perPage, total)
	response.SuccessWithMeta(c, 200, "Users retrieved successfully", users, meta)
}

// HandleUpdateUser handles updating a user
// @Summary Update user
// @Description Update user details (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param request body services.UpdateUserRequest true "User data"
// @Success 200 {object} response.Response{data=services.UserResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/users/{id} [put]
func (h *UserHandler) HandleUpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid user ID", nil)
		return
	}

	var req services.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	user, err := h.userService.UpdateUser(id, req)
	if err != nil {
		switch err {
		case appErrors.ErrUserNotFound:
			response.NotFound(c, "User not found")
		case appErrors.ErrAlreadyExists:
			response.Conflict(c, "Email already in use")
		default:
			response.InternalServerError(c, "Failed to update user")
		}
		return
	}

	response.OK(c, "User updated successfully", user)
}

// HandleUpdateUserStatus handles updating user status
// @Summary Update user status
// @Description Update user status (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param request body object{status=string} true "User status"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/users/{id}/status [patch]
func (h *UserHandler) HandleUpdateUserStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid user ID", nil)
		return
	}

	var req struct {
		Status models.UserStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	err = h.userService.UpdateUserStatus(id, req.Status)
	if err != nil {
		switch err {
		case appErrors.ErrUserNotFound:
			response.NotFound(c, "User not found")
		default:
			response.InternalServerError(c, "Failed to update user status")
		}
		return
	}

	response.OK(c, "User status updated successfully", nil)
}

// HandleDeleteUser handles deleting a user
// @Summary Delete user
// @Description Soft delete a user (Admin only)
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/users/{id} [delete]
func (h *UserHandler) HandleDeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid user ID", nil)
		return
	}

	err = h.userService.DeleteUser(id)
	if err != nil {
		switch err {
		case appErrors.ErrUserNotFound:
			response.NotFound(c, "User not found")
		default:
			response.InternalServerError(c, "Failed to delete user")
		}
		return
	}

	response.OK(c, "User deleted successfully", nil)
}

// HandleLinkUserToCompany handles linking a user to a company
// @Summary Link user to company
// @Description Link a user to a company (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param request body object{company_id=string} true "Company ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/users/{id}/companies [post]
func (h *UserHandler) HandleLinkUserToCompany(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid user ID", nil)
		return
	}

	var req struct {
		CompanyID uuid.UUID `json:"company_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	err = h.userService.LinkUserToCompany(userID, req.CompanyID)
	if err != nil {
		switch err {
		case appErrors.ErrUserNotFound:
			response.NotFound(c, "User not found")
		case appErrors.ErrUserInactive:
			response.Forbidden(c, "User is inactive")
		case appErrors.ErrAlreadyExists:
			response.Conflict(c, "User is already linked to this company")
		default:
			response.InternalServerError(c, "Failed to link user to company")
		}
		return
	}

	response.OK(c, "User linked to company successfully", nil)
}

// HandleUnlinkUserFromCompany handles unlinking a user from a company
// @Summary Unlink user from company
// @Description Unlink a user from a company (Admin only)
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param company_id path string true "Company ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/users/{id}/companies/{company_id} [delete]
func (h *UserHandler) HandleUnlinkUserFromCompany(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid user ID", nil)
		return
	}

	companyIDStr := c.Param("company_id")
	companyID, err := uuid.Parse(companyIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid company ID", nil)
		return
	}

	err = h.userService.UnlinkUserFromCompany(userID, companyID)
	if err != nil {
		switch err {
		case appErrors.ErrNotLinkedToCompany:
			response.NotFound(c, "User is not linked to this company")
		default:
			response.InternalServerError(c, "Failed to unlink user from company")
		}
		return
	}

	response.OK(c, "User unlinked from company successfully", nil)
}

