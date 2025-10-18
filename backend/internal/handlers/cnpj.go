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

type CNPJHandler struct {
	cfg *config.Config
}

func NewCNPJHandler(cfg *config.Config) *CNPJHandler {
	return &CNPJHandler{cfg: cfg}
}

type CreateCNPJRequest struct {
	CNPJ         string `json:"cnpj"`
	RazaoSocial  string `json:"razao_social"`
	NomeFantasia string `json:"nome_fantasia"`
	Autorizado   bool   `json:"autorizado"`
}

type UpdateCNPJRequest struct {
	RazaoSocial  string `json:"razao_social"`
	NomeFantasia string `json:"nome_fantasia"`
	Autorizado   *bool  `json:"autorizado,omitempty"`
	Ativo        *bool  `json:"ativo,omitempty"`
}

// GetEmpresaCNPJs - GET /api/v1/admin/empresas/:id/cnpjs
func (h *CNPJHandler) GetEmpresaCNPJs(w http.ResponseWriter, r *http.Request) {
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

	var cnpjs []models.CNPJ
	if err := database.DB.Where("empresa_id = ?", empresaID).Order("created_at DESC").Find(&cnpjs).Error; err != nil {
		http.Error(w, "Failed to fetch CNPJs", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cnpjs)
}

// CreateCNPJ - POST /api/v1/admin/empresas/:id/cnpjs
func (h *CNPJHandler) CreateCNPJ(w http.ResponseWriter, r *http.Request) {
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

	var req CreateCNPJRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.CNPJ == "" {
		http.Error(w, "CNPJ is required", http.StatusBadRequest)
		return
	}

	empresaUUID, err := uuid.Parse(empresaID)
	if err != nil {
		http.Error(w, "Invalid empresa ID", http.StatusBadRequest)
		return
	}

	cnpj := models.CNPJ{
		EmpresaID:    empresaUUID,
		CNPJ:         req.CNPJ,
		RazaoSocial:  req.RazaoSocial,
		NomeFantasia: req.NomeFantasia,
		Autorizado:   req.Autorizado,
		Ativo:        true,
	}

	if err := database.DB.Create(&cnpj).Error; err != nil {
		http.Error(w, "Failed to create CNPJ", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(cnpj)
}

// UpdateCNPJ - PUT /api/v1/admin/cnpjs/:id
func (h *CNPJHandler) UpdateCNPJ(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	cnpjID := chi.URLParam(r, "id")
	if cnpjID == "" {
		http.Error(w, "CNPJ ID is required", http.StatusBadRequest)
		return
	}

	var req UpdateCNPJRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var cnpj models.CNPJ
	if err := database.DB.First(&cnpj, "id = ?", cnpjID).Error; err != nil {
		http.Error(w, "CNPJ not found", http.StatusNotFound)
		return
	}

	// Update fields
	if req.RazaoSocial != "" {
		cnpj.RazaoSocial = req.RazaoSocial
	}
	if req.NomeFantasia != "" {
		cnpj.NomeFantasia = req.NomeFantasia
	}
	if req.Autorizado != nil {
		cnpj.Autorizado = *req.Autorizado
	}
	if req.Ativo != nil {
		cnpj.Ativo = *req.Ativo
	}

	if err := database.DB.Save(&cnpj).Error; err != nil {
		http.Error(w, "Failed to update CNPJ", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cnpj)
}

// DeleteCNPJ - DELETE /api/v1/admin/cnpjs/:id
func (h *CNPJHandler) DeleteCNPJ(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	cnpjID := chi.URLParam(r, "id")
	if cnpjID == "" {
		http.Error(w, "CNPJ ID is required", http.StatusBadRequest)
		return
	}

	var cnpj models.CNPJ
	if err := database.DB.First(&cnpj, "id = ?", cnpjID).Error; err != nil {
		http.Error(w, "CNPJ not found", http.StatusNotFound)
		return
	}

	// Soft delete
	cnpj.Ativo = false
	if err := database.DB.Save(&cnpj).Error; err != nil {
		http.Error(w, "Failed to delete CNPJ", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "CNPJ deleted successfully"})
}

