package services

import (
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/pkg/crypto"
	appErrors "github.com/movix/backend/pkg/errors"
	"github.com/movix/backend/pkg/jwt"
	"gorm.io/gorm"
)

// AuthService handles authentication business logic
type AuthService struct {
	userRepo        *repositories.UserRepository
	userCompanyRepo *repositories.UserCompanyRepository
	jwtManager      *jwt.JWTManager
}

// NewAuthService creates a new auth service
func NewAuthService(
	userRepo *repositories.UserRepository,
	userCompanyRepo *repositories.UserCompanyRepository,
	jwtManager *jwt.JWTManager,
) *AuthService {
	return &AuthService{
		userRepo:        userRepo,
		userCompanyRepo: userCompanyRepo,
		jwtManager:      jwtManager,
	}
}

// LoginRequest represents a login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse represents a login response
type LoginResponse struct {
	User         *UserResponse `json:"user"`
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	ExpiresAt    string        `json:"expires_at"`
}

// UserResponse represents a user in responses
type UserResponse struct {
	ID        uuid.UUID  `json:"id"`
	AccountID *uuid.UUID `json:"account_id,omitempty"`
	Email     string     `json:"email"`
	Name      string     `json:"name"`
	Phone     string     `json:"phone"`
	Role      string     `json:"role"`
	Status    string     `json:"status"`
}

// Login authenticates a user and returns tokens
func (s *AuthService) Login(email, password string) (*LoginResponse, error) {
	// Find user by email
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.ErrInvalidCredentials
		}
		return nil, err
	}

	// Check if user is active
	if !user.IsActive() {
		if user.Status == models.UserStatusSuspended {
			return nil, appErrors.ErrUserSuspended
		}
		return nil, appErrors.ErrUserInactive
	}

	// Verify password
	if !crypto.VerifyPassword(user.Password, password) {
		return nil, appErrors.ErrInvalidCredentials
	}

	// For regular users, get their first company as default context
	var companyID *uuid.UUID
	if user.Role == models.RoleUser {
		userCompanies, err := s.userCompanyRepo.ListCompaniesByUser(user.ID)
		if err == nil && len(userCompanies) > 0 {
			companyID = &userCompanies[0].CompanyID
		}
	}

	// Generate tokens
	tokenPair, err := s.jwtManager.GenerateTokenPair(
		user.ID,
		user.AccountID,
		companyID,
		user.Email,
		user.Name,
		string(user.Role),
	)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		User: &UserResponse{
			ID:        user.ID,
			AccountID: user.AccountID,
			Email:     user.Email,
			Name:      user.Name,
			Phone:     user.Phone,
			Role:      string(user.Role),
			Status:    string(user.Status),
		},
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresAt:    tokenPair.ExpiresAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// RefreshTokenRequest represents a refresh token request
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// RefreshToken generates a new access token from a refresh token
func (s *AuthService) RefreshToken(refreshToken string) (*LoginResponse, error) {
	// Validate refresh token
	claims, err := s.jwtManager.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, appErrors.ErrInvalidToken
	}

	// Parse user ID from claims
	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return nil, appErrors.ErrInvalidToken
	}

	// Get user
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.ErrUserNotFound
		}
		return nil, err
	}

	// Check if user is active
	if !user.IsActive() {
		return nil, appErrors.ErrUserInactive
	}

	// For regular users, get their first company as default context
	var companyID *uuid.UUID
	if user.Role == models.RoleUser {
		userCompanies, err := s.userCompanyRepo.ListCompaniesByUser(user.ID)
		if err == nil && len(userCompanies) > 0 {
			companyID = &userCompanies[0].CompanyID
		}
	}

	// Generate new access token
	accessToken, err := s.jwtManager.RefreshAccessToken(
		refreshToken,
		user.ID,
		user.AccountID,
		companyID,
		user.Email,
		user.Name,
		string(user.Role),
	)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		User: &UserResponse{
			ID:        user.ID,
			AccountID: user.AccountID,
			Email:     user.Email,
			Name:      user.Name,
			Phone:     user.Phone,
			Role:      string(user.Role),
			Status:    string(user.Status),
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

// SwitchCompanyRequest represents a switch company request
type SwitchCompanyRequest struct {
	CompanyID uuid.UUID `json:"company_id" binding:"required"`
}

// SwitchCompany switches the user's current company context
func (s *AuthService) SwitchCompany(userID, companyID uuid.UUID) (*LoginResponse, error) {
	// Get user
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.ErrUserNotFound
		}
		return nil, err
	}

	// Check if user has access to the company
	hasAccess, err := s.userCompanyRepo.HasAccess(userID, companyID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, appErrors.ErrNoAccessToCompany
	}

	// Generate new tokens with the new company context
	tokenPair, err := s.jwtManager.GenerateTokenPair(
		user.ID,
		user.AccountID,
		&companyID,
		user.Email,
		user.Name,
		string(user.Role),
	)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		User: &UserResponse{
			ID:        user.ID,
			AccountID: user.AccountID,
			Email:     user.Email,
			Name:      user.Name,
			Phone:     user.Phone,
			Role:      string(user.Role),
			Status:    string(user.Status),
		},
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresAt:    tokenPair.ExpiresAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// GetUserCompanies returns all companies for a user
func (s *AuthService) GetUserCompanies(userID uuid.UUID) ([]models.UserCompany, error) {
	return s.userCompanyRepo.ListCompaniesByUser(userID)
}

