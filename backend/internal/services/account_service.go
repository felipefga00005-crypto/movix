package services

import (
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/pkg/crypto"
	appErrors "github.com/movix/backend/pkg/errors"
	"gorm.io/gorm"
)

// AccountService handles account business logic
type AccountService struct {
	accountRepo *repositories.AccountRepository
	userRepo    *repositories.UserRepository
}

// NewAccountService creates a new account service
func NewAccountService(
	accountRepo *repositories.AccountRepository,
	userRepo *repositories.UserRepository,
) *AccountService {
	return &AccountService{
		accountRepo: accountRepo,
		userRepo:    userRepo,
	}
}

// CreateAccountRequest represents a request to create an account
type CreateAccountRequest struct {
	Name              string `json:"name" binding:"required"`
	Email             string `json:"email" binding:"required,email"`
	Phone             string `json:"phone"`
	Document          string `json:"document" binding:"required"` // CNPJ
	MaxCompanies      int    `json:"max_companies" binding:"required,min=1"`
	MaxUsers          int    `json:"max_users" binding:"required,min=1"`
	MaxNFesPerMonth   int    `json:"max_nfes_per_month" binding:"required,min=1"`
	AdminName         string `json:"admin_name" binding:"required"`
	AdminEmail        string `json:"admin_email" binding:"required,email"`
	AdminPhone        string `json:"admin_phone"`
	AdminPassword     string `json:"admin_password" binding:"required,min=8"`
}

// UpdateAccountLimitsRequest represents a request to update account limits
type UpdateAccountLimitsRequest struct {
	MaxCompanies    int `json:"max_companies" binding:"required,min=1"`
	MaxUsers        int `json:"max_users" binding:"required,min=1"`
	MaxNFesPerMonth int `json:"max_nfes_per_month" binding:"required,min=1"`
}

// AccountResponse represents an account in responses
type AccountResponse struct {
	ID              uuid.UUID              `json:"id"`
	Name            string                 `json:"name"`
	Email           string                 `json:"email"`
	Phone           string                 `json:"phone"`
	Document        string                 `json:"document"`
	MaxCompanies    int                    `json:"max_companies"`
	MaxUsers        int                    `json:"max_users"`
	MaxNFesPerMonth int                    `json:"max_nfes_per_month"`
	Status          models.AccountStatus   `json:"status"`
	CreatedAt       string                 `json:"created_at"`
	UpdatedAt       string                 `json:"updated_at"`
}

// CreateAccount creates a new account with its first admin user
func (s *AccountService) CreateAccount(req CreateAccountRequest) (*AccountResponse, error) {
	// Check if account with same document already exists
	existingAccount, err := s.accountRepo.FindByDocument(req.Document)
	if err == nil && existingAccount != nil {
		return nil, appErrors.ErrAlreadyExists
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Check if account with same email already exists
	existingAccount, err = s.accountRepo.FindByEmail(req.Email)
	if err == nil && existingAccount != nil {
		return nil, appErrors.ErrAlreadyExists
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Create account
	account := &models.Account{
		Name:            req.Name,
		Email:           req.Email,
		Phone:           req.Phone,
		Document:        req.Document,
		MaxCompanies:    req.MaxCompanies,
		MaxUsers:        req.MaxUsers,
		MaxNFesPerMonth: req.MaxNFesPerMonth,
		Status:          models.AccountStatusActive,
	}

	if err := s.accountRepo.Create(account); err != nil {
		return nil, err
	}

	// Create first admin user
	if err := s.CreateFirstAdmin(account.ID, req.AdminName, req.AdminEmail, req.AdminPhone, req.AdminPassword); err != nil {
		// Rollback: delete the account if admin creation fails
		s.accountRepo.Delete(account.ID)
		return nil, err
	}

	return &AccountResponse{
		ID:              account.ID,
		Name:            account.Name,
		Email:           account.Email,
		Phone:           account.Phone,
		Document:        account.Document,
		MaxCompanies:    account.MaxCompanies,
		MaxUsers:        account.MaxUsers,
		MaxNFesPerMonth: account.MaxNFesPerMonth,
		Status:          account.Status,
		CreatedAt:       account.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:       account.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// CreateFirstAdmin creates the first admin user for an account
func (s *AccountService) CreateFirstAdmin(accountID uuid.UUID, name, email, phone, password string) error {
	// Check if admin email already exists
	existingUser, err := s.userRepo.FindByEmail(email)
	if err == nil && existingUser != nil {
		return appErrors.ErrAlreadyExists
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return err
	}

	// Hash password
	hashedPassword, err := crypto.HashPassword(password)
	if err != nil {
		return err
	}

	// Create admin user
	admin := &models.User{
		AccountID: &accountID,
		Email:     email,
		Password:  hashedPassword,
		Name:      name,
		Phone:     phone,
		Role:      models.RoleAdmin,
		Status:    models.UserStatusActive,
	}

	return s.userRepo.Create(admin)
}

// GetAccountByID gets an account by ID
func (s *AccountService) GetAccountByID(id uuid.UUID) (*AccountResponse, error) {
	account, err := s.accountRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.ErrAccountNotFound
		}
		return nil, err
	}

	return &AccountResponse{
		ID:              account.ID,
		Name:            account.Name,
		Email:           account.Email,
		Phone:           account.Phone,
		Document:        account.Document,
		MaxCompanies:    account.MaxCompanies,
		MaxUsers:        account.MaxUsers,
		MaxNFesPerMonth: account.MaxNFesPerMonth,
		Status:          account.Status,
		CreatedAt:       account.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:       account.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// ListAccounts lists all accounts with pagination
func (s *AccountService) ListAccounts(status *models.AccountStatus, page, perPage int) ([]AccountResponse, int64, error) {
	accounts, total, err := s.accountRepo.List(status, page, perPage)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]AccountResponse, len(accounts))
	for i, account := range accounts {
		responses[i] = AccountResponse{
			ID:              account.ID,
			Name:            account.Name,
			Email:           account.Email,
			Phone:           account.Phone,
			Document:        account.Document,
			MaxCompanies:    account.MaxCompanies,
			MaxUsers:        account.MaxUsers,
			MaxNFesPerMonth: account.MaxNFesPerMonth,
			Status:          account.Status,
			CreatedAt:       account.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:       account.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return responses, total, nil
}

// UpdateAccountLimits updates account limits
func (s *AccountService) UpdateAccountLimits(id uuid.UUID, req UpdateAccountLimitsRequest) (*AccountResponse, error) {
	// Get account
	account, err := s.accountRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.ErrAccountNotFound
		}
		return nil, err
	}

	// Update limits
	if err := s.accountRepo.UpdateLimits(id, req.MaxCompanies, req.MaxUsers, req.MaxNFesPerMonth); err != nil {
		return nil, err
	}

	// Reload account
	account, err = s.accountRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	return &AccountResponse{
		ID:              account.ID,
		Name:            account.Name,
		Email:           account.Email,
		Phone:           account.Phone,
		Document:        account.Document,
		MaxCompanies:    account.MaxCompanies,
		MaxUsers:        account.MaxUsers,
		MaxNFesPerMonth: account.MaxNFesPerMonth,
		Status:          account.Status,
		CreatedAt:       account.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:       account.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// UpdateAccountStatus updates account status
func (s *AccountService) UpdateAccountStatus(id uuid.UUID, status models.AccountStatus) error {
	// Check if account exists
	_, err := s.accountRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appErrors.ErrAccountNotFound
		}
		return err
	}

	return s.accountRepo.UpdateStatus(id, status)
}

// DeleteAccount soft deletes an account
func (s *AccountService) DeleteAccount(id uuid.UUID) error {
	// Check if account exists
	_, err := s.accountRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appErrors.ErrAccountNotFound
		}
		return err
	}

	// TODO: Check if account has companies/users before deleting
	// For now, just delete

	return s.accountRepo.Delete(id)
}

