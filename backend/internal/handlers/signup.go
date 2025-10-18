package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/pkg/utils"
)

type SignupHandler struct {
	cfg *config.Config
}

func NewSignupHandler(cfg *config.Config) *SignupHandler {
	return &SignupHandler{cfg: cfg}
}

type CreateInviteRequest struct {
	Email     string           `json:"email"`
	Role      models.UserRole  `json:"role"`
	EmpresaID *string          `json:"empresa_id,omitempty"`
}

type AcceptInviteRequest struct {
	Token    string `json:"token"`
	Nome     string `json:"nome"`
	Password string `json:"password"`
}

type RequestPasswordResetRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

// CreateInvite - POST /api/v1/admin/invites (Super Admin only)
func (h *SignupHandler) CreateInvite(w http.ResponseWriter, r *http.Request) {
	var req CreateInviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Role == "" {
		http.Error(w, "Email and role are required", http.StatusBadRequest)
		return
	}

	// Generate random token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}
	token := hex.EncodeToString(tokenBytes)

	var empresaID *uuid.UUID
	if req.EmpresaID != nil && *req.EmpresaID != "" {
		parsed, err := uuid.Parse(*req.EmpresaID)
		if err != nil {
			http.Error(w, "Invalid empresa_id", http.StatusBadRequest)
			return
		}
		empresaID = &parsed
	}

	invite := models.UserInvite{
		Email:     req.Email,
		Token:     token,
		Role:      req.Role,
		EmpresaID: empresaID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // 7 days
		Used:      false,
	}

	if err := database.DB.Create(&invite).Error; err != nil {
		http.Error(w, "Failed to create invite", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Invite created successfully",
		"token":   token,
		"email":   req.Email,
		"expires_at": invite.ExpiresAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// GetInvite - GET /api/v1/auth/invites/:token
func (h *SignupHandler) GetInvite(w http.ResponseWriter, r *http.Request) {
	token := chi.URLParam(r, "token")
	if token == "" {
		http.Error(w, "Token is required", http.StatusBadRequest)
		return
	}

	var invite models.UserInvite
	if err := database.DB.Where("token = ? AND used = ? AND expires_at > ?", token, false, time.Now()).First(&invite).Error; err != nil {
		http.Error(w, "Invalid or expired invite", http.StatusNotFound)
		return
	}

	response := map[string]interface{}{
		"email":      invite.Email,
		"role":       invite.Role,
		"empresa_id": invite.EmpresaID,
		"expires_at": invite.ExpiresAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// AcceptInvite - POST /api/v1/auth/invites/accept
func (h *SignupHandler) AcceptInvite(w http.ResponseWriter, r *http.Request) {
	var req AcceptInviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Token == "" || req.Nome == "" || req.Password == "" {
		http.Error(w, "Token, nome and password are required", http.StatusBadRequest)
		return
	}

	// Find invite
	var invite models.UserInvite
	if err := database.DB.Where("token = ? AND used = ? AND expires_at > ?", req.Token, false, time.Now()).First(&invite).Error; err != nil {
		http.Error(w, "Invalid or expired invite", http.StatusNotFound)
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create user based on role
	if invite.Role == models.RoleSuperAdmin {
		superAdmin := models.SuperAdmin{
			Email:        invite.Email,
			PasswordHash: hashedPassword,
			Nome:         req.Nome,
			Ativo:        true,
		}

		if err := database.DB.Create(&superAdmin).Error; err != nil {
			http.Error(w, "Failed to create super admin", http.StatusInternalServerError)
			return
		}
	} else {
		if invite.EmpresaID == nil {
			http.Error(w, "Empresa ID is required for non-super admin users", http.StatusBadRequest)
			return
		}

		usuario := models.Usuario{
			EmpresaID:    *invite.EmpresaID,
			Email:        invite.Email,
			PasswordHash: hashedPassword,
			Nome:         req.Nome,
			Role:         invite.Role,
			Ativo:        true,
		}

		if err := database.DB.Create(&usuario).Error; err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}
	}

	// Mark invite as used
	invite.Used = true
	database.DB.Save(&invite)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Account created successfully"})
}

// RequestPasswordReset - POST /api/v1/auth/password-reset/request
func (h *SignupHandler) RequestPasswordReset(w http.ResponseWriter, r *http.Request) {
	var req RequestPasswordResetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	// Check if user exists (in either SuperAdmin or Usuario)
	var exists bool
	var superAdmin models.SuperAdmin
	var usuario models.Usuario

	if err := database.DB.Where("email = ?", req.Email).First(&superAdmin).Error; err == nil {
		exists = true
	} else if err := database.DB.Where("email = ?", req.Email).First(&usuario).Error; err == nil {
		exists = true
	}

	// Always return success to prevent email enumeration
	if !exists {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "If the email exists, a reset link will be sent"})
		return
	}

	// Generate random token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}
	token := hex.EncodeToString(tokenBytes)

	passwordReset := models.PasswordReset{
		Email:     req.Email,
		Token:     token,
		ExpiresAt: time.Now().Add(1 * time.Hour), // 1 hour
		Used:      false,
	}

	if err := database.DB.Create(&passwordReset).Error; err != nil {
		http.Error(w, "Failed to create password reset", http.StatusInternalServerError)
		return
	}

	// TODO: Send email with reset link
	// For now, return token in response (only for development)
	response := map[string]interface{}{
		"message": "If the email exists, a reset link will be sent",
		"token":   token, // Remove this in production
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ResetPassword - POST /api/v1/auth/password-reset/confirm
func (h *SignupHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Token == "" || req.Password == "" {
		http.Error(w, "Token and password are required", http.StatusBadRequest)
		return
	}

	// Find password reset
	var passwordReset models.PasswordReset
	if err := database.DB.Where("token = ? AND used = ? AND expires_at > ?", req.Token, false, time.Now()).First(&passwordReset).Error; err != nil {
		http.Error(w, "Invalid or expired token", http.StatusNotFound)
		return
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Update password (check both SuperAdmin and Usuario)
	var superAdmin models.SuperAdmin
	if err := database.DB.Where("email = ?", passwordReset.Email).First(&superAdmin).Error; err == nil {
		superAdmin.PasswordHash = hashedPassword
		database.DB.Save(&superAdmin)
	} else {
		var usuario models.Usuario
		if err := database.DB.Where("email = ?", passwordReset.Email).First(&usuario).Error; err == nil {
			usuario.PasswordHash = hashedPassword
			database.DB.Save(&usuario)
		} else {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
	}

	// Mark reset as used
	passwordReset.Used = true
	database.DB.Save(&passwordReset)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Password reset successfully"})
}

