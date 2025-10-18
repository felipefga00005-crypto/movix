package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/middleware"
	"github.com/movix/backend/internal/models"
)

type EmpresaHandler struct {
	cfg *config.Config
}

func NewEmpresaHandler(cfg *config.Config) *EmpresaHandler {
	return &EmpresaHandler{cfg: cfg}
}

type CreateEmpresaRequest struct {
	Nome        string `json:"nome"`
	RazaoSocial string `json:"razao_social"`
	Plano       string `json:"plano"`
	Status      string `json:"status"`
}

type UpdateEmpresaRequest struct {
	Nome        string `json:"nome"`
	RazaoSocial string `json:"razao_social"`
	Plano       string `json:"plano"`
	Status      string `json:"status"`
	Ativo       *bool  `json:"ativo,omitempty"`
}

// ListEmpresas - GET /api/v1/admin/empresas
func (h *EmpresaHandler) ListEmpresas(w http.ResponseWriter, r *http.Request) {
	// Verify user is super admin
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	var empresas []models.Empresa
	if err := database.DB.Order("created_at DESC").Find(&empresas).Error; err != nil {
		http.Error(w, "Failed to fetch empresas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(empresas)
}

// GetEmpresa - GET /api/v1/admin/empresas/:id
func (h *EmpresaHandler) GetEmpresa(w http.ResponseWriter, r *http.Request) {
	// Verify user is super admin
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	empresaID := chi.URLParam(r, "id")
	if empresaID == "" {
		http.Error(w, "Empresa ID is required", http.StatusBadRequest)
		return
	}

	var empresa models.Empresa
	if err := database.DB.First(&empresa, "id = ?", empresaID).Error; err != nil {
		http.Error(w, "Empresa not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(empresa)
}

// CreateEmpresa - POST /api/v1/admin/empresas
func (h *EmpresaHandler) CreateEmpresa(w http.ResponseWriter, r *http.Request) {
	// Verify user is super admin
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	var req CreateEmpresaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Nome == "" {
		http.Error(w, "Nome is required", http.StatusBadRequest)
		return
	}

	// Set defaults
	if req.Plano == "" {
		req.Plano = "basic"
	}
	if req.Status == "" {
		req.Status = "active"
	}

	empresa := models.Empresa{
		Nome:        req.Nome,
		RazaoSocial: req.RazaoSocial,
		Plano:       req.Plano,
		Status:      req.Status,
		Ativo:       true,
	}

	if err := database.DB.Create(&empresa).Error; err != nil {
		http.Error(w, "Failed to create empresa", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(empresa)
}

// UpdateEmpresa - PUT /api/v1/admin/empresas/:id
func (h *EmpresaHandler) UpdateEmpresa(w http.ResponseWriter, r *http.Request) {
	// Verify user is super admin
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	empresaID := chi.URLParam(r, "id")
	if empresaID == "" {
		http.Error(w, "Empresa ID is required", http.StatusBadRequest)
		return
	}

	var req UpdateEmpresaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var empresa models.Empresa
	if err := database.DB.First(&empresa, "id = ?", empresaID).Error; err != nil {
		http.Error(w, "Empresa not found", http.StatusNotFound)
		return
	}

	// Update fields
	if req.Nome != "" {
		empresa.Nome = req.Nome
	}
	if req.RazaoSocial != "" {
		empresa.RazaoSocial = req.RazaoSocial
	}
	if req.Plano != "" {
		empresa.Plano = req.Plano
	}
	if req.Status != "" {
		empresa.Status = req.Status
	}
	if req.Ativo != nil {
		empresa.Ativo = *req.Ativo
	}

	if err := database.DB.Save(&empresa).Error; err != nil {
		http.Error(w, "Failed to update empresa", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(empresa)
}

// DeleteEmpresa - DELETE /api/v1/admin/empresas/:id
func (h *EmpresaHandler) DeleteEmpresa(w http.ResponseWriter, r *http.Request) {
	// Verify user is super admin
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	empresaID := chi.URLParam(r, "id")
	if empresaID == "" {
		http.Error(w, "Empresa ID is required", http.StatusBadRequest)
		return
	}

	var empresa models.Empresa
	if err := database.DB.First(&empresa, "id = ?", empresaID).Error; err != nil {
		http.Error(w, "Empresa not found", http.StatusNotFound)
		return
	}

	// Soft delete by setting ativo = false
	empresa.Ativo = false
	if err := database.DB.Save(&empresa).Error; err != nil {
		http.Error(w, "Failed to delete empresa", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Empresa deleted successfully"})
}

// GetEmpresaModulos - GET /api/v1/admin/empresas/:id/modulos
func (h *EmpresaHandler) GetEmpresaModulos(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	empresaID := chi.URLParam(r, "id")
	if empresaID == "" {
		http.Error(w, "Empresa ID is required", http.StatusBadRequest)
		return
	}

	var empresaModulos []models.EmpresaModulo
	if err := database.DB.Preload("Modulo").Where("empresa_id = ?", empresaID).Find(&empresaModulos).Error; err != nil {
		http.Error(w, "Failed to fetch modulos", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(empresaModulos)
}

// ActivateModulo - POST /api/v1/admin/empresas/:id/modulos
func (h *EmpresaHandler) ActivateModulo(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	empresaID := chi.URLParam(r, "id")
	if empresaID == "" {
		http.Error(w, "Empresa ID is required", http.StatusBadRequest)
		return
	}

	var req struct {
		ModuloID string `json:"modulo_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	empresaUUID, err := uuid.Parse(empresaID)
	if err != nil {
		http.Error(w, "Invalid empresa ID", http.StatusBadRequest)
		return
	}

	moduloUUID, err := uuid.Parse(req.ModuloID)
	if err != nil {
		http.Error(w, "Invalid modulo ID", http.StatusBadRequest)
		return
	}

	empresaModulo := models.EmpresaModulo{
		EmpresaID: empresaUUID,
		ModuloID:  moduloUUID,
		Ativo:     true,
	}

	if err := database.DB.Create(&empresaModulo).Error; err != nil {
		http.Error(w, "Failed to activate modulo", http.StatusInternalServerError)
		return
	}

	// Preload modulo data
	database.DB.Preload("Modulo").First(&empresaModulo, empresaModulo.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(empresaModulo)
}

// DeactivateModulo - DELETE /api/v1/admin/empresas/:id/modulos/:modulo_id
func (h *EmpresaHandler) DeactivateModulo(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	empresaID := chi.URLParam(r, "id")
	moduloID := chi.URLParam(r, "modulo_id")

	if empresaID == "" || moduloID == "" {
		http.Error(w, "Empresa ID and Modulo ID are required", http.StatusBadRequest)
		return
	}

	result := database.DB.Where("empresa_id = ? AND modulo_id = ?", empresaID, moduloID).Delete(&models.EmpresaModulo{})
	if result.Error != nil {
		http.Error(w, "Failed to deactivate modulo", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Modulo deactivated successfully"})
}

