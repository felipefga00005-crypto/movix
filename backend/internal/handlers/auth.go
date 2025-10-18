package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/middleware"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/pkg/utils"
)

// HealthCheck - GET /health
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

type AuthHandler struct {
	cfg *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{cfg: cfg}
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

type UserResponse struct {
	ID        uuid.UUID       `json:"id"`
	Email     string          `json:"email"`
	Nome      string          `json:"nome"`
	Role      models.UserRole `json:"role"`
	EmpresaID *uuid.UUID      `json:"empresa_id,omitempty"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Try to find user in SuperAdmin table
	var superAdmin models.SuperAdmin
	if err := database.DB.Where("email = ? AND ativo = ?", req.Email, true).First(&superAdmin).Error; err == nil {
		// SuperAdmin found
		if !utils.CheckPassword(req.Password, superAdmin.PasswordHash) {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		token, err := utils.GenerateToken(superAdmin.ID, superAdmin.Email, models.RoleSuperAdmin, nil, h.cfg.JWTSecret)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		response := LoginResponse{
			Token: token,
			User: UserResponse{
				ID:    superAdmin.ID,
				Email: superAdmin.Email,
				Nome:  superAdmin.Nome,
				Role:  models.RoleSuperAdmin,
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	// Try to find user in Usuario table
	var usuario models.Usuario
	if err := database.DB.Where("email = ? AND ativo = ?", req.Email, true).First(&usuario).Error; err == nil {
		// Usuario found
		if !utils.CheckPassword(req.Password, usuario.PasswordHash) {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		token, err := utils.GenerateToken(usuario.ID, usuario.Email, usuario.Role, &usuario.EmpresaID, h.cfg.JWTSecret)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		response := LoginResponse{
			Token: token,
			User: UserResponse{
				ID:        usuario.ID,
				Email:     usuario.Email,
				Nome:      usuario.Nome,
				Role:      usuario.Role,
				EmpresaID: &usuario.EmpresaID,
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	// User not found
	http.Error(w, "Invalid credentials", http.StatusUnauthorized)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	response := UserResponse{
		ID:        claims.UserID,
		Email:     claims.Email,
		Nome:      "", // We don't have nome in claims, would need to fetch from DB
		Role:      claims.Role,
		EmpresaID: claims.EmpresaID,
	}

	// Fetch full user data from database
	if claims.Role == models.RoleSuperAdmin {
		var superAdmin models.SuperAdmin
		if err := database.DB.First(&superAdmin, claims.UserID).Error; err == nil {
			response.Nome = superAdmin.Nome
		}
	} else {
		var usuario models.Usuario
		if err := database.DB.First(&usuario, claims.UserID).Error; err == nil {
			response.Nome = usuario.Nome
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// In a stateless JWT system, logout is handled client-side
	// Here we just return success
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Generate new token
	token, err := utils.GenerateToken(claims.UserID, claims.Email, claims.Role, claims.EmpresaID, h.cfg.JWTSecret)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

