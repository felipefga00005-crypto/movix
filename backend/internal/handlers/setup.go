package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/pkg/utils"
)

type SetupHandler struct {
	cfg *config.Config
}

func NewSetupHandler(cfg *config.Config) *SetupHandler {
	return &SetupHandler{cfg: cfg}
}

type SetupRequest struct {
	Nome     string `json:"nome"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SetupStatusResponse struct {
	NeedsSetup bool `json:"needs_setup"`
}

// CheckSetup - GET /api/v1/setup/status
func (h *SetupHandler) CheckSetup(w http.ResponseWriter, r *http.Request) {
	var count int64
	database.DB.Model(&models.SuperAdmin{}).Count(&count)

	response := SetupStatusResponse{
		NeedsSetup: count == 0,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CreateInitialAdmin - POST /api/v1/setup
func (h *SetupHandler) CreateInitialAdmin(w http.ResponseWriter, r *http.Request) {
	// Check if setup is already done
	var count int64
	database.DB.Model(&models.SuperAdmin{}).Count(&count)

	if count > 0 {
		http.Error(w, "Setup already completed", http.StatusForbidden)
		return
	}

	var req SetupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Nome == "" || req.Email == "" || req.Password == "" {
		http.Error(w, "Nome, email and password are required", http.StatusBadRequest)
		return
	}

	// Validate password length
	if len(req.Password) < 6 {
		http.Error(w, "Password must be at least 6 characters", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create super admin
	superAdmin := models.SuperAdmin{
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Nome:         req.Nome,
		Ativo:        true,
	}

	if err := database.DB.Create(&superAdmin).Error; err != nil {
		http.Error(w, "Failed to create super admin", http.StatusInternalServerError)
		return
	}

	// Generate token for immediate login
	token, err := utils.GenerateToken(superAdmin.ID, superAdmin.Email, models.RoleSuperAdmin, nil, h.cfg.JWTSecret)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Setup completed successfully",
		"token":   token,
		"user": map[string]interface{}{
			"id":    superAdmin.ID,
			"email": superAdmin.Email,
			"nome":  superAdmin.Nome,
			"role":  models.RoleSuperAdmin,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

