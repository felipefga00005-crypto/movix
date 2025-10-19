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

// CompanyHandler handles company HTTP requests
type CompanyHandler struct {
	companyService *services.CompanyService
}

// NewCompanyHandler creates a new company handler
func NewCompanyHandler(companyService *services.CompanyService) *CompanyHandler {
	return &CompanyHandler{
		companyService: companyService,
	}
}

// HandleCreateCompany handles company creation
// @Summary Create company
// @Description Create a new company (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body services.CreateCompanyRequest true "Company data"
// @Success 201 {object} response.Response{data=services.CompanyResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/admin/companies [post]
func (h *CompanyHandler) HandleCreateCompany(c *gin.Context) {
	var req services.CreateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	company, err := h.companyService.CreateCompany(req)
	if err != nil {
		switch err {
		case appErrors.ErrAccountNotFound:
			response.NotFound(c, "Account not found")
		case appErrors.ErrAccountSuspended:
			response.Forbidden(c, "Account is suspended")
		case appErrors.ErrMaxCompaniesReached:
			response.Forbidden(c, "Maximum number of companies reached for this account")
		case appErrors.ErrAlreadyExists:
			response.Conflict(c, "Company with this document already exists in this account")
		default:
			response.InternalServerError(c, "Failed to create company")
		}
		return
	}

	response.Created(c, "Company created successfully", company)
}

// HandleGetCompany handles getting a company by ID
// @Summary Get company
// @Description Get company details by ID (Admin only)
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param id path string true "Company ID"
// @Success 200 {object} response.Response{data=services.CompanyResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/companies/{id} [get]
func (h *CompanyHandler) HandleGetCompany(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid company ID", nil)
		return
	}

	company, err := h.companyService.GetCompanyByID(id)
	if err != nil {
		switch err {
		case appErrors.ErrCompanyNotFound:
			response.NotFound(c, "Company not found")
		default:
			response.InternalServerError(c, "Failed to get company")
		}
		return
	}

	response.OK(c, "Company retrieved successfully", company)
}

// HandleListCompanies handles listing companies
// @Summary List companies
// @Description List all companies for an account with pagination (Admin only)
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param account_id query string true "Account ID"
// @Param status query string false "Filter by status (active, inactive)"
// @Param page query int false "Page number" default(1)
// @Param per_page query int false "Items per page" default(10)
// @Success 200 {object} response.Response{data=[]services.CompanyResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/admin/companies [get]
func (h *CompanyHandler) HandleListCompanies(c *gin.Context) {
	// Get account_id from query
	accountIDStr := c.Query("account_id")
	if accountIDStr == "" {
		response.BadRequest(c, "account_id is required", nil)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid account_id", nil)
		return
	}

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
	var status *models.CompanyStatus
	statusStr := c.Query("status")
	if statusStr != "" {
		s := models.CompanyStatus(statusStr)
		status = &s
	}

	companies, total, err := h.companyService.ListCompanies(accountID, status, page, perPage)
	if err != nil {
		response.InternalServerError(c, "Failed to list companies")
		return
	}

	meta := response.CalculateMeta(page, perPage, total)
	response.SuccessWithMeta(c, 200, "Companies retrieved successfully", companies, meta)
}

// HandleUpdateCompany handles updating a company
// @Summary Update company
// @Description Update company details (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Company ID"
// @Param request body services.UpdateCompanyRequest true "Company data"
// @Success 200 {object} response.Response{data=services.CompanyResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/companies/{id} [put]
func (h *CompanyHandler) HandleUpdateCompany(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid company ID", nil)
		return
	}

	var req services.UpdateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	company, err := h.companyService.UpdateCompany(id, req)
	if err != nil {
		switch err {
		case appErrors.ErrCompanyNotFound:
			response.NotFound(c, "Company not found")
		default:
			response.InternalServerError(c, "Failed to update company")
		}
		return
	}

	response.OK(c, "Company updated successfully", company)
}

// HandleUpdateCompanyStatus handles updating company status
// @Summary Update company status
// @Description Update company status (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Company ID"
// @Param request body object{status=string} true "Company status"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/companies/{id}/status [patch]
func (h *CompanyHandler) HandleUpdateCompanyStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid company ID", nil)
		return
	}

	var req struct {
		Status models.CompanyStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	err = h.companyService.UpdateCompanyStatus(id, req.Status)
	if err != nil {
		switch err {
		case appErrors.ErrCompanyNotFound:
			response.NotFound(c, "Company not found")
		default:
			response.InternalServerError(c, "Failed to update company status")
		}
		return
	}

	response.OK(c, "Company status updated successfully", nil)
}

// HandleDeleteCompany handles deleting a company
// @Summary Delete company
// @Description Soft delete a company (Admin only)
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param id path string true "Company ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/companies/{id} [delete]
func (h *CompanyHandler) HandleDeleteCompany(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid company ID", nil)
		return
	}

	err = h.companyService.DeleteCompany(id)
	if err != nil {
		switch err {
		case appErrors.ErrCompanyNotFound:
			response.NotFound(c, "Company not found")
		default:
			response.InternalServerError(c, "Failed to delete company")
		}
		return
	}

	response.OK(c, "Company deleted successfully", nil)
}

