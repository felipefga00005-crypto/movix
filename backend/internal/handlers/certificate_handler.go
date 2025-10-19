package handlers

import (
	"io"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/movix/backend/internal/services"
	appErrors "github.com/movix/backend/pkg/errors"
	"github.com/movix/backend/pkg/response"
)

// CertificateHandler handles certificate HTTP requests
type CertificateHandler struct {
	certService *services.CertificateService
}

// NewCertificateHandler creates a new certificate handler
func NewCertificateHandler(certService *services.CertificateService) *CertificateHandler {
	return &CertificateHandler{
		certService: certService,
	}
}

// HandleUploadCertificate handles certificate upload
// @Summary Upload certificate
// @Description Upload a digital certificate (.pfx) for a company
// @Tags certificates
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param company_id path string true "Company ID"
// @Param name formData string true "Certificate name"
// @Param password formData string true "Certificate password"
// @Param file formData file true "Certificate file (.pfx)"
// @Success 201 {object} response.Response{data=services.CertificateResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/companies/{company_id}/certificate [post]
func (h *CertificateHandler) HandleUploadCertificate(c *gin.Context) {
	// Get company ID from URL
	companyIDStr := c.Param("company_id")
	companyID, err := uuid.Parse(companyIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid company ID", nil)
		return
	}

	// Get form data
	name := c.PostForm("name")
	password := c.PostForm("password")

	if name == "" || password == "" {
		response.BadRequest(c, "Name and password are required", nil)
		return
	}

	// Get uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "Certificate file is required", nil)
		return
	}

	// Check file extension
	if file.Filename[len(file.Filename)-4:] != ".pfx" {
		response.BadRequest(c, "Only .pfx files are allowed", nil)
		return
	}

	// Read file content
	fileContent, err := file.Open()
	if err != nil {
		response.InternalServerError(c, "Failed to read certificate file")
		return
	}
	defer fileContent.Close()

	content, err := io.ReadAll(fileContent)
	if err != nil {
		response.InternalServerError(c, "Failed to read certificate file")
		return
	}

	// Upload certificate
	req := services.UploadCertificateRequest{
		CompanyID: companyID,
		Name:      name,
		Content:   content,
		Password:  password,
	}

	cert, err := h.certService.UploadCertificate(req)
	if err != nil {
		switch err {
		case appErrors.ErrCompanyNotFound:
			response.NotFound(c, "Company not found")
		default:
			response.BadRequest(c, err.Error(), nil)
		}
		return
	}

	response.Created(c, "Certificate uploaded successfully", cert)
}

// HandleGetActiveCertificate handles getting the active certificate for a company
// @Summary Get active certificate
// @Description Get the active certificate for a company
// @Tags certificates
// @Produce json
// @Security BearerAuth
// @Param company_id path string true "Company ID"
// @Success 200 {object} response.Response{data=services.CertificateResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/companies/{company_id}/certificate [get]
func (h *CertificateHandler) HandleGetActiveCertificate(c *gin.Context) {
	// Get company ID from URL
	companyIDStr := c.Param("company_id")
	companyID, err := uuid.Parse(companyIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid company ID", nil)
		return
	}

	cert, err := h.certService.GetActiveCertificate(companyID)
	if err != nil {
		switch err {
		case appErrors.ErrCertificateNotFound:
			response.NotFound(c, "No active certificate found")
		default:
			response.BadRequest(c, err.Error(), nil)
		}
		return
	}

	response.OK(c, "Certificate retrieved successfully", cert)
}

// HandleGetCompanyCertificates handles getting all certificates for a company
// @Summary Get company certificates
// @Description Get all certificates for a company
// @Tags certificates
// @Produce json
// @Security BearerAuth
// @Param company_id path string true "Company ID"
// @Success 200 {object} response.Response{data=[]services.CertificateResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/admin/companies/{company_id}/certificates [get]
func (h *CertificateHandler) HandleGetCompanyCertificates(c *gin.Context) {
	// Get company ID from URL
	companyIDStr := c.Param("company_id")
	companyID, err := uuid.Parse(companyIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid company ID", nil)
		return
	}

	certs, err := h.certService.GetCompanyCertificates(companyID)
	if err != nil {
		response.InternalServerError(c, "Failed to get certificates")
		return
	}

	response.OK(c, "Certificates retrieved successfully", certs)
}

// HandleDeleteCertificate handles deleting a certificate
// @Summary Delete certificate
// @Description Delete a certificate
// @Tags certificates
// @Produce json
// @Security BearerAuth
// @Param company_id path string true "Company ID"
// @Param id path string true "Certificate ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/admin/companies/{company_id}/certificates/{id} [delete]
func (h *CertificateHandler) HandleDeleteCertificate(c *gin.Context) {
	// Get certificate ID from URL
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid certificate ID", nil)
		return
	}

	err = h.certService.DeleteCertificate(id)
	if err != nil {
		switch err {
		case appErrors.ErrCertificateNotFound:
			response.NotFound(c, "Certificate not found")
		default:
			response.InternalServerError(c, "Failed to delete certificate")
		}
		return
	}

	response.OK(c, "Certificate deleted successfully", nil)
}

