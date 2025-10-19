package services

import (
	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	appErrors "github.com/movix/backend/pkg/errors"
	"gorm.io/gorm"
)

// CompanyService handles company business logic
type CompanyService struct {
	companyRepo *repositories.CompanyRepository
	accountRepo *repositories.AccountRepository
}

// NewCompanyService creates a new company service
func NewCompanyService(
	companyRepo *repositories.CompanyRepository,
	accountRepo *repositories.AccountRepository,
) *CompanyService {
	return &CompanyService{
		companyRepo: companyRepo,
		accountRepo: accountRepo,
	}
}

// CreateCompanyRequest represents a request to create a company
type CreateCompanyRequest struct {
	AccountID            uuid.UUID          `json:"account_id" binding:"required"`
	TradeName            string             `json:"trade_name" binding:"required"`
	LegalName            string             `json:"legal_name" binding:"required"`
	Document             string             `json:"document" binding:"required"` // CNPJ
	StateRegistration    string             `json:"state_registration"`
	MunicipalRegistration string            `json:"municipal_registration"`
	Address              models.Address     `json:"address" binding:"required"`
	TaxRegime            models.TaxRegime   `json:"tax_regime" binding:"required"`
	Environment          models.Environment `json:"environment" binding:"required"`
	NFeSeries            int                `json:"nfe_series" binding:"required,min=1"`
}

// UpdateCompanyRequest represents a request to update a company
type UpdateCompanyRequest struct {
	TradeName            string             `json:"trade_name"`
	LegalName            string             `json:"legal_name"`
	StateRegistration    string             `json:"state_registration"`
	MunicipalRegistration string            `json:"municipal_registration"`
	Address              *models.Address    `json:"address"`
	TaxRegime            models.TaxRegime   `json:"tax_regime"`
	Environment          models.Environment `json:"environment"`
	NFeSeries            int                `json:"nfe_series"`
}

// CompanyResponse represents a company in responses
type CompanyResponse struct {
	ID                   uuid.UUID            `json:"id"`
	AccountID            uuid.UUID            `json:"account_id"`
	TradeName            string               `json:"trade_name"`
	LegalName            string               `json:"legal_name"`
	Document             string               `json:"document"`
	StateRegistration    string               `json:"state_registration"`
	MunicipalRegistration string              `json:"municipal_registration"`
	Address              models.Address       `json:"address"`
	TaxRegime            models.TaxRegime     `json:"tax_regime"`
	Environment          models.Environment   `json:"environment"`
	CertificateID        *uuid.UUID           `json:"certificate_id,omitempty"`
	NextNFeNumber        int                  `json:"next_nfe_number"`
	NFeSeries            int                  `json:"nfe_series"`
	Status               models.CompanyStatus `json:"status"`
	CreatedAt            string               `json:"created_at"`
	UpdatedAt            string               `json:"updated_at"`
}

// CreateCompany creates a new company
func (s *CompanyService) CreateCompany(req CreateCompanyRequest) (*CompanyResponse, error) {
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

	// Check max_companies limit
	currentCount, err := s.companyRepo.CountByAccount(req.AccountID)
	if err != nil {
		return nil, err
	}

	if !account.CanCreateCompany(int(currentCount)) {
		return nil, appErrors.ErrMaxCompaniesReached
	}

	// Check if company with same document already exists in this account
	existingCompany, err := s.companyRepo.FindByAccountAndDocument(req.AccountID, req.Document)
	if err == nil && existingCompany != nil {
		return nil, appErrors.ErrAlreadyExists
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Create company
	company := &models.Company{
		AccountID:            req.AccountID,
		TradeName:            req.TradeName,
		LegalName:            req.LegalName,
		Document:             req.Document,
		StateRegistration:    req.StateRegistration,
		MunicipalRegistration: req.MunicipalRegistration,
		Address:              req.Address,
		TaxRegime:            req.TaxRegime,
		Environment:          req.Environment,
		NextNFeNumber:        1,
		NFeSeries:            req.NFeSeries,
		Status:               models.CompanyStatusActive,
	}

	if err := s.companyRepo.Create(company); err != nil {
		return nil, err
	}

	return &CompanyResponse{
		ID:                   company.ID,
		AccountID:            company.AccountID,
		TradeName:            company.TradeName,
		LegalName:            company.LegalName,
		Document:             company.Document,
		StateRegistration:    company.StateRegistration,
		MunicipalRegistration: company.MunicipalRegistration,
		Address:              company.Address,
		TaxRegime:            company.TaxRegime,
		Environment:          company.Environment,
		CertificateID:        company.CertificateID,
		NextNFeNumber:        company.NextNFeNumber,
		NFeSeries:            company.NFeSeries,
		Status:               company.Status,
		CreatedAt:            company.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:            company.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// GetCompanyByID gets a company by ID
func (s *CompanyService) GetCompanyByID(id uuid.UUID) (*CompanyResponse, error) {
	company, err := s.companyRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.ErrCompanyNotFound
		}
		return nil, err
	}

	return &CompanyResponse{
		ID:                   company.ID,
		AccountID:            company.AccountID,
		TradeName:            company.TradeName,
		LegalName:            company.LegalName,
		Document:             company.Document,
		StateRegistration:    company.StateRegistration,
		MunicipalRegistration: company.MunicipalRegistration,
		Address:              company.Address,
		TaxRegime:            company.TaxRegime,
		Environment:          company.Environment,
		CertificateID:        company.CertificateID,
		NextNFeNumber:        company.NextNFeNumber,
		NFeSeries:            company.NFeSeries,
		Status:               company.Status,
		CreatedAt:            company.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:            company.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// ListCompanies lists companies by account with pagination
func (s *CompanyService) ListCompanies(accountID uuid.UUID, status *models.CompanyStatus, page, perPage int) ([]CompanyResponse, int64, error) {
	companies, total, err := s.companyRepo.ListByAccount(accountID, status, page, perPage)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]CompanyResponse, len(companies))
	for i, company := range companies {
		responses[i] = CompanyResponse{
			ID:                   company.ID,
			AccountID:            company.AccountID,
			TradeName:            company.TradeName,
			LegalName:            company.LegalName,
			Document:             company.Document,
			StateRegistration:    company.StateRegistration,
			MunicipalRegistration: company.MunicipalRegistration,
			Address:              company.Address,
			TaxRegime:            company.TaxRegime,
			Environment:          company.Environment,
			CertificateID:        company.CertificateID,
			NextNFeNumber:        company.NextNFeNumber,
			NFeSeries:            company.NFeSeries,
			Status:               company.Status,
			CreatedAt:            company.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:            company.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return responses, total, nil
}

// UpdateCompany updates a company
func (s *CompanyService) UpdateCompany(id uuid.UUID, req UpdateCompanyRequest) (*CompanyResponse, error) {
	// Get company
	company, err := s.companyRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appErrors.ErrCompanyNotFound
		}
		return nil, err
	}

	// Update fields if provided
	if req.TradeName != "" {
		company.TradeName = req.TradeName
	}
	if req.LegalName != "" {
		company.LegalName = req.LegalName
	}
	if req.StateRegistration != "" {
		company.StateRegistration = req.StateRegistration
	}
	if req.MunicipalRegistration != "" {
		company.MunicipalRegistration = req.MunicipalRegistration
	}
	if req.Address != nil {
		company.Address = *req.Address
	}
	if req.TaxRegime != "" {
		company.TaxRegime = req.TaxRegime
	}
	if req.Environment != "" {
		company.Environment = req.Environment
	}
	if req.NFeSeries > 0 {
		company.NFeSeries = req.NFeSeries
	}

	if err := s.companyRepo.Update(company); err != nil {
		return nil, err
	}

	return &CompanyResponse{
		ID:                   company.ID,
		AccountID:            company.AccountID,
		TradeName:            company.TradeName,
		LegalName:            company.LegalName,
		Document:             company.Document,
		StateRegistration:    company.StateRegistration,
		MunicipalRegistration: company.MunicipalRegistration,
		Address:              company.Address,
		TaxRegime:            company.TaxRegime,
		Environment:          company.Environment,
		CertificateID:        company.CertificateID,
		NextNFeNumber:        company.NextNFeNumber,
		NFeSeries:            company.NFeSeries,
		Status:               company.Status,
		CreatedAt:            company.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:            company.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

// UpdateCompanyStatus updates company status
func (s *CompanyService) UpdateCompanyStatus(id uuid.UUID, status models.CompanyStatus) error {
	// Check if company exists
	_, err := s.companyRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appErrors.ErrCompanyNotFound
		}
		return err
	}

	return s.companyRepo.UpdateStatus(id, status)
}

// DeleteCompany soft deletes a company
func (s *CompanyService) DeleteCompany(id uuid.UUID) error {
	// Check if company exists
	_, err := s.companyRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appErrors.ErrCompanyNotFound
		}
		return err
	}

	// TODO: Check if company has NFes before deleting
	// For now, just delete

	return s.companyRepo.Delete(id)
}

