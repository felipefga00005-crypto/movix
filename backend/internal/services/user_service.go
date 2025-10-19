package services

import (
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/pkg/crypto"
	appErrors "github.com/movix/backend/pkg/errors"
	"gorm.io/gorm"
)

// UserService handles user business logic
type UserService struct {
	userRepo        *repositories.UserRepository
	accountRepo     *repositories.AccountRepository
	userCompanyRepo *repositories.UserCompanyRepository
}

// NewUserService creates a new user service
func NewUserService(
	userRepo *repositories.UserRepository,
	accountRepo *repositories.AccountRepository,
	userCompanyRepo *repositories.UserCompanyRepository,
) *UserService {
	return &UserService{
		userRepo:        userRepo,
		accountRepo:     accountRepo,
		userCompanyRepo: userCompanyRepo,
	}
}

// CreateUserRequest represents a request to create a user
type CreateUserRequest struct {
	AccountID uuid.UUID      `json:"account_id" binding:"required"`
	Email     string         `json:"email" binding:"required,email"`
	Password  string         `json:"password" binding:"required,min=8"`
	Name      string         `json:"name" binding:"required"`
	Phone     string         `json:"phone"`
	Role      models.UserRole `json:"role" binding:"required"`
}

// UpdateUserRequest represents a request to update a user
type UpdateUserRequest struct {
	Email    string         `json:"email" binding:"omitempty,email"`
	Password string         `json:"password" binding:"omitempty,min=8"`
	Name     string         `json:"name"`
	Phone    string         `json:"phone"`
	Role     models.UserRole `json:"role"`
}

// LinkUserToCompanyRequest represents a request to link a user to a company
type LinkUserToCompanyRequest struct {
	UserID    uuid.UUID `json:"user_id" binding:"required"`
	CompanyID uuid.UUID `json:"company_id" binding:"required"`
}

// CreateUser creates a new user
func (s *UserService) CreateUser(req CreateUserRequest) (*UserResponse, error) {
	// Get account to validate limits
	account, err := s.accountRepo.FindByID(req.AccountID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.ErrAccountNotFound
		}
		return nil, err
	}

	// Check if account is active
	if !account.IsActive() {
		return nil, appErrors.ErrAccountSuspended
	}

	// Check max_users limit
	currentCount, err := s.userRepo.CountByAccount(req.AccountID)
	if err != nil {
		return nil, err
	}

	if !account.CanCreateUser(int(currentCount)) {
		return nil, appErrors.ErrMaxUsersReached
	}

	// Check if user with same email already exists
	existingUser, err := s.userRepo.FindByEmail(req.Email)
	if err == nil && existingUser != nil {
		return nil, appErrors.ErrAlreadyExists
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Hash password
	hashedPassword, err := crypto.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		AccountID: &req.AccountID,
		Email:     req.Email,
		Password:  hashedPassword,
		Name:      req.Name,
		Phone:     req.Phone,
		Role:      req.Role,
		Status:    models.UserStatusActive,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return &UserResponse{
		ID:        user.ID,
		AccountID: user.AccountID,
		Email:     user.Email,
		Name:      user.Name,
		Phone:     user.Phone,
		Role:      string(user.Role),
		Status:    string(user.Status),
	}, nil
}

// GetUserByID gets a user by ID
func (s *UserService) GetUserByID(id uuid.UUID) (*UserResponse, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.ErrUserNotFound
		}
		return nil, err
	}

	return &UserResponse{
		ID:        user.ID,
		AccountID: user.AccountID,
		Email:     user.Email,
		Name:      user.Name,
		Phone:     user.Phone,
		Role:      string(user.Role),
		Status:    string(user.Status),
	}, nil
}

// ListUsers lists users by account with pagination
func (s *UserService) ListUsers(accountID *uuid.UUID, page, perPage int) ([]UserResponse, int64, error) {
	users, total, err := s.userRepo.List(accountID, page, perPage)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]UserResponse, len(users))
	for i, user := range users {
		responses[i] = UserResponse{
			ID:        user.ID,
			AccountID: user.AccountID,
			Email:     user.Email,
			Name:      user.Name,
			Phone:     user.Phone,
			Role:      string(user.Role),
			Status:    string(user.Status),
		}
	}

	return responses, total, nil
}

// UpdateUser updates a user
func (s *UserService) UpdateUser(id uuid.UUID, req UpdateUserRequest) (*UserResponse, error) {
	// Get user
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.ErrUserNotFound
		}
		return nil, err
	}

	// Update fields if provided
	if req.Email != "" {
		// Check if email is already in use by another user
		existingUser, err := s.userRepo.FindByEmail(req.Email)
		if err == nil && existingUser != nil && existingUser.ID != id {
			return nil, appErrors.ErrAlreadyExists
		}
		if err != nil && err != gorm.ErrRecordNotFound {
			return nil, err
		}
		user.Email = req.Email
	}

	if req.Password != "" {
		hashedPassword, err := crypto.HashPassword(req.Password)
		if err != nil {
			return nil, err
		}
		user.Password = hashedPassword
	}

	if req.Name != "" {
		user.Name = req.Name
	}

	if req.Phone != "" {
		user.Phone = req.Phone
	}

	if req.Role != "" {
		user.Role = req.Role
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	return &UserResponse{
		ID:        user.ID,
		AccountID: user.AccountID,
		Email:     user.Email,
		Name:      user.Name,
		Phone:     user.Phone,
		Role:      string(user.Role),
		Status:    string(user.Status),
	}, nil
}

// UpdateUserStatus updates user status
func (s *UserService) UpdateUserStatus(id uuid.UUID, status models.UserStatus) error {
	// Check if user exists
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appErrors.ErrUserNotFound
		}
		return err
	}

	user := &models.User{ID: id, Status: status}
	return s.userRepo.Update(user)
}

// DeleteUser soft deletes a user
func (s *UserService) DeleteUser(id uuid.UUID) error {
	// Check if user exists
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appErrors.ErrUserNotFound
		}
		return err
	}

	return s.userRepo.Delete(id)
}

// LinkUserToCompany links a user to a company
func (s *UserService) LinkUserToCompany(userID, companyID uuid.UUID) error {
	// Check if user exists
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appErrors.ErrUserNotFound
		}
		return err
	}

	// Check if user is active
	if !user.IsActive() {
		return appErrors.ErrUserInactive
	}

	// Check if link already exists
	existing, err := s.userCompanyRepo.FindByUserAndCompany(userID, companyID)
	if err == nil && existing != nil {
		return appErrors.ErrAlreadyExists
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return err
	}

	// Create link
	userCompany := &models.UserCompany{
		UserID:    userID,
		CompanyID: companyID,
	}

	return s.userCompanyRepo.Create(userCompany)
}

// UnlinkUserFromCompany unlinks a user from a company
func (s *UserService) UnlinkUserFromCompany(userID, companyID uuid.UUID) error {
	// Check if link exists
	_, err := s.userCompanyRepo.FindByUserAndCompany(userID, companyID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appErrors.ErrNotLinkedToCompany
		}
		return err
	}

	return s.userCompanyRepo.Delete(userID, companyID)
}

// GetUserCompanies gets all companies linked to a user
func (s *UserService) GetUserCompanies(userID uuid.UUID) ([]models.UserCompany, error) {
	return s.userCompanyRepo.ListCompaniesByUser(userID)
}

