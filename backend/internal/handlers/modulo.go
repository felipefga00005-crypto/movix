package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/middleware"
	"github.com/movix/backend/internal/models"
)

type ModuloHandler struct {
	cfg *config.Config
}

func NewModuloHandler(cfg *config.Config) *ModuloHandler {
	return &ModuloHandler{cfg: cfg}
}

type CreateModuloRequest struct {
	Nome      string `json:"nome"`
	Descricao string `json:"descricao"`
	Slug      string `json:"slug"`
}

// ListModulos - GET /api/v1/admin/modulos
func (h *ModuloHandler) ListModulos(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	var modulos []models.Modulo
	if err := database.DB.Where("ativo = ?", true).Order("nome ASC").Find(&modulos).Error; err != nil {
		http.Error(w, "Failed to fetch modulos", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(modulos)
}

// CreateModulo - POST /api/v1/admin/modulos
func (h *ModuloHandler) CreateModulo(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || claims.Role != models.RoleSuperAdmin {
		http.Error(w, "Forbidden: Super Admin access required", http.StatusForbidden)
		return
	}

	var req CreateModuloRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Nome == "" || req.Slug == "" {
		http.Error(w, "Nome and Slug are required", http.StatusBadRequest)
		return
	}

	modulo := models.Modulo{
		Nome:      req.Nome,
		Descricao: req.Descricao,
		Slug:      req.Slug,
		Ativo:     true,
	}

	if err := database.DB.Create(&modulo).Error; err != nil {
		http.Error(w, "Failed to create modulo", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(modulo)
}

