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

// NFeHandler handles NFe HTTP requests
type NFeHandler struct {
	nfeService *services.NFeService
}

// NewNFeHandler creates a new NFe handler
func NewNFeHandler(nfeService *services.NFeService) *NFeHandler {
	return &NFeHandler{
		nfeService: nfeService,
	}
}

// HandleCreateNFe handles NFe creation (draft)
// @Summary Create NFe draft
// @Description Create a new NFe in draft status
// @Tags nfe
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body services.CreateNFeRequest true "NFe data"
// @Success 201 {object} response.Response{data=services.NFeResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/nfes [post]
func (h *NFeHandler) HandleCreateNFe(c *gin.Context) {
	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	// Convert to UUID
	var userID uuid.UUID
	switch v := userIDStr.(type) {
	case string:
		id, err := uuid.Parse(v)
		if err != nil {
			response.BadRequest(c, "Invalid user ID", nil)
			return
		}
		userID = id
	case uuid.UUID:
		userID = v
	default:
		response.BadRequest(c, "Invalid user ID type", nil)
		return
	}

	var req services.CreateNFeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	nfe, err := h.nfeService.CreateDraft(userID, req)
	if err != nil {
		switch err {
		case appErrors.ErrCompanyNotFound:
			response.NotFound(c, "Company not found")
		default:
			response.BadRequest(c, err.Error(), nil)
		}
		return
	}

	response.Created(c, "NFe draft created successfully", nfe)
}

// HandleAuthorizeNFe handles NFe authorization
// @Summary Authorize NFe
// @Description Send NFe to SEFAZ for authorization
// @Tags nfe
// @Produce json
// @Security BearerAuth
// @Param id path string true "NFe ID"
// @Success 200 {object} response.Response{data=services.NFeResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/nfes/{id}/authorize [post]
func (h *NFeHandler) HandleAuthorizeNFe(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid NFe ID", nil)
		return
	}

	nfe, err := h.nfeService.AuthorizeNFe(id)
	if err != nil {
		switch err {
		case appErrors.ErrNFeNotFound:
			response.NotFound(c, "NFe not found")
		default:
			response.BadRequest(c, err.Error(), nil)
		}
		return
	}

	response.OK(c, "NFe authorized successfully", nfe)
}

// HandleCancelNFe handles NFe cancellation
// @Summary Cancel NFe
// @Description Cancel an authorized NFe
// @Tags nfe
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "NFe ID"
// @Param request body object{justificativa=string} true "Cancellation justification"
// @Success 200 {object} response.Response{data=services.NFeResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/nfes/{id}/cancel [post]
func (h *NFeHandler) HandleCancelNFe(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid NFe ID", nil)
		return
	}

	var req struct {
		Justificativa string `json:"justificativa" binding:"required,min=15"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	nfe, err := h.nfeService.CancelNFe(id, req.Justificativa)
	if err != nil {
		switch err {
		case appErrors.ErrNFeNotFound:
			response.NotFound(c, "NFe not found")
		default:
			response.BadRequest(c, err.Error(), nil)
		}
		return
	}

	response.OK(c, "NFe cancelled successfully", nfe)
}

// HandleGetNFe handles getting an NFe by ID
// @Summary Get NFe
// @Description Get NFe details by ID
// @Tags nfe
// @Produce json
// @Security BearerAuth
// @Param id path string true "NFe ID"
// @Success 200 {object} response.Response{data=services.NFeResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/nfes/{id} [get]
func (h *NFeHandler) HandleGetNFe(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid NFe ID", nil)
		return
	}

	nfe, err := h.nfeService.GetNFeByID(id)
	if err != nil {
		switch err {
		case appErrors.ErrNFeNotFound:
			response.NotFound(c, "NFe not found")
		default:
			response.InternalServerError(c, "Failed to get NFe")
		}
		return
	}

	response.OK(c, "NFe retrieved successfully", nfe)
}

// HandleListNFes handles listing NFes
// @Summary List NFes
// @Description List NFes with filters and pagination
// @Tags nfe
// @Produce json
// @Security BearerAuth
// @Param company_id query string false "Filter by company ID"
// @Param status query string false "Filter by status (draft, authorized, rejected, cancelled)"
// @Param page query int false "Page number" default(1)
// @Param per_page query int false "Items per page" default(10)
// @Success 200 {object} response.Response{data=[]services.NFeResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/nfes [get]
func (h *NFeHandler) HandleListNFes(c *gin.Context) {
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

	// Get company_id filter (optional)
	var companyID *uuid.UUID
	companyIDStr := c.Query("company_id")
	if companyIDStr != "" {
		id, err := uuid.Parse(companyIDStr)
		if err != nil {
			response.BadRequest(c, "Invalid company_id", nil)
			return
		}
		companyID = &id
	}

	// Get status filter (optional)
	var status *models.NFeStatus
	statusStr := c.Query("status")
	if statusStr != "" {
		s := models.NFeStatus(statusStr)
		status = &s
	}

	nfes, total, err := h.nfeService.ListNFes(companyID, status, page, perPage)
	if err != nil {
		response.InternalServerError(c, "Failed to list NFes")
		return
	}

	meta := response.CalculateMeta(page, perPage, total)
	response.SuccessWithMeta(c, 200, "NFes retrieved successfully", nfes, meta)
}

// HandleDownloadXML handles downloading NFe XML
// @Summary Download NFe XML
// @Description Download the XML of an authorized NFe
// @Tags nfe
// @Produce xml
// @Security BearerAuth
// @Param id path string true "NFe ID"
// @Success 200 {string} string "XML content"
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/nfes/{id}/xml [get]
func (h *NFeHandler) HandleDownloadXML(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid NFe ID", nil)
		return
	}

	xml, err := h.nfeService.DownloadXML(id)
	if err != nil {
		switch err {
		case appErrors.ErrNFeNotFound:
			response.NotFound(c, "NFe not found")
		default:
			response.BadRequest(c, err.Error(), nil)
		}
		return
	}

	// Set headers for XML download
	c.Header("Content-Type", "application/xml")
	c.Header("Content-Disposition", "attachment; filename=nfe_"+idStr+".xml")
	c.String(200, xml)
}

