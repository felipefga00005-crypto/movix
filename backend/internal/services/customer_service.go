package services

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/internal/validators"
)

// CustomerService handles business logic for customers
type CustomerService struct {
	repo *repositories.CustomerRepository
}

// NewCustomerService creates a new customer service
func NewCustomerService(repo *repositories.CustomerRepository) *CustomerService {
	return &CustomerService{repo: repo}
}

// CriarCliente creates a new customer with validations
func (s *CustomerService) CriarCliente(customer *models.Customer) error {
	// Validate required fields
	if customer.CompanyID == uuid.Nil {
		return errors.New("company_id é obrigatório")
	}
	
	if customer.Name == "" {
		return errors.New("nome é obrigatório")
	}
	
	if customer.Document == "" {
		return errors.New("documento (CPF/CNPJ) é obrigatório")
	}
	
	if customer.PersonType == "" {
		return errors.New("tipo de pessoa é obrigatório")
	}
	
	// Clean and validate document
	customer.Document = validators.RemoverFormatacao(customer.Document)
	
	if customer.PersonType == models.PersonTypeIndividual {
		if err := validators.ValidarCPF(customer.Document); err != nil {
			return err
		}
	} else if customer.PersonType == models.PersonTypeLegal {
		if err := validators.ValidarCNPJ(customer.Document); err != nil {
			return err
		}
	}
	
	// Check if document already exists
	exists, err := s.repo.ExistsByDocument(customer.CompanyID, customer.Document, nil)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("já existe um cliente com este documento")
	}
	
	// Validate address fields if provided
	if customer.ZipCode != "" {
		customer.ZipCode = validators.RemoverFormatacao(customer.ZipCode)
		if err := validators.ValidarCEP(customer.ZipCode); err != nil {
			return err
		}
	}
	
	if customer.State != "" {
		customer.State = strings.ToUpper(strings.TrimSpace(customer.State))
		if err := validators.ValidarUF(customer.State); err != nil {
			return err
		}
	}
	
	if customer.CityCode != "" {
		customer.CityCode = validators.RemoverFormatacao(customer.CityCode)
		if err := validators.ValidarCodigoIBGE(customer.CityCode); err != nil {
			return err
		}
	}
	
	// Validate email
	if err := validators.ValidarEmail(customer.Email); err != nil {
		return err
	}
	
	// Validate phone
	if customer.Phone != "" {
		customer.Phone = validators.RemoverFormatacao(customer.Phone)
		if err := validators.ValidarTelefone(customer.Phone); err != nil {
			return err
		}
	}
	
	if customer.Mobile != "" {
		customer.Mobile = validators.RemoverFormatacao(customer.Mobile)
		if err := validators.ValidarTelefone(customer.Mobile); err != nil {
			return err
		}
	}
	
	// Create customer
	return s.repo.Create(customer)
}

// ObterCliente gets a customer by ID
func (s *CustomerService) ObterCliente(id uuid.UUID) (*models.Customer, error) {
	return s.repo.FindByID(id)
}

// ListarClientes lists all customers of a company
func (s *CustomerService) ListarClientes(companyID uuid.UUID, activeOnly bool) ([]models.Customer, error) {
	return s.repo.ListByCompany(companyID, activeOnly)
}

// AtualizarCliente updates a customer with validations
func (s *CustomerService) AtualizarCliente(customer *models.Customer) error {
	// Validate required fields
	if customer.ID == uuid.Nil {
		return errors.New("ID é obrigatório")
	}
	
	if customer.Name == "" {
		return errors.New("nome é obrigatório")
	}
	
	if customer.Document == "" {
		return errors.New("documento (CPF/CNPJ) é obrigatório")
	}
	
	// Clean and validate document
	customer.Document = validators.RemoverFormatacao(customer.Document)
	
	if customer.PersonType == models.PersonTypeIndividual {
		if err := validators.ValidarCPF(customer.Document); err != nil {
			return err
		}
	} else if customer.PersonType == models.PersonTypeLegal {
		if err := validators.ValidarCNPJ(customer.Document); err != nil {
			return err
		}
	}
	
	// Check if document already exists (excluding current customer)
	exists, err := s.repo.ExistsByDocument(customer.CompanyID, customer.Document, &customer.ID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("já existe outro cliente com este documento")
	}
	
	// Validate address fields if provided
	if customer.ZipCode != "" {
		customer.ZipCode = validators.RemoverFormatacao(customer.ZipCode)
		if err := validators.ValidarCEP(customer.ZipCode); err != nil {
			return err
		}
	}
	
	if customer.State != "" {
		customer.State = strings.ToUpper(strings.TrimSpace(customer.State))
		if err := validators.ValidarUF(customer.State); err != nil {
			return err
		}
	}
	
	if customer.CityCode != "" {
		customer.CityCode = validators.RemoverFormatacao(customer.CityCode)
		if err := validators.ValidarCodigoIBGE(customer.CityCode); err != nil {
			return err
		}
	}
	
	// Validate email
	if err := validators.ValidarEmail(customer.Email); err != nil {
		return err
	}
	
	// Validate phone
	if customer.Phone != "" {
		customer.Phone = validators.RemoverFormatacao(customer.Phone)
		if err := validators.ValidarTelefone(customer.Phone); err != nil {
			return err
		}
	}
	
	if customer.Mobile != "" {
		customer.Mobile = validators.RemoverFormatacao(customer.Mobile)
		if err := validators.ValidarTelefone(customer.Mobile); err != nil {
			return err
		}
	}
	
	// Update customer
	return s.repo.Update(customer)
}

// DeletarCliente soft deletes a customer
func (s *CustomerService) DeletarCliente(id uuid.UUID) error {
	return s.repo.Delete(id)
}

// BuscarPorDocumento finds a customer by document
func (s *CustomerService) BuscarPorDocumento(companyID uuid.UUID, document string) (*models.Customer, error) {
	document = validators.RemoverFormatacao(document)
	return s.repo.FindByDocument(companyID, document)
}

// PesquisarClientes searches customers by name or document
func (s *CustomerService) PesquisarClientes(companyID uuid.UUID, term string, limit int) ([]models.Customer, error) {
	return s.repo.Search(companyID, term, limit)
}

