package services

import (
	"errors"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/internal/validators"
)

// CarrierService handles business logic for carriers
type CarrierService struct {
	repo *repositories.CarrierRepository
}

// NewCarrierService creates a new carrier service
func NewCarrierService(repo *repositories.CarrierRepository) *CarrierService {
	return &CarrierService{repo: repo}
}

// ValidarPlacaVeiculo validates a vehicle plate (Brazilian format)
func ValidarPlacaVeiculo(placa string) error {
	if placa == "" {
		return nil // Plate is optional
	}
	
	// Remove spaces and convert to uppercase
	placa = strings.ToUpper(strings.TrimSpace(placa))
	placa = strings.ReplaceAll(placa, "-", "")
	
	// Brazilian plates can be:
	// Old format: AAA-9999 (3 letters + 4 numbers)
	// New format (Mercosul): AAA9A99 (3 letters + 1 number + 1 letter + 2 numbers)
	oldFormat := regexp.MustCompile(`^[A-Z]{3}\d{4}$`)
	newFormat := regexp.MustCompile(`^[A-Z]{3}\d[A-Z]\d{2}$`)
	
	if !oldFormat.MatchString(placa) && !newFormat.MatchString(placa) {
		return errors.New("placa de veículo inválida (formato: AAA-9999 ou AAA9A99)")
	}
	
	return nil
}

// CriarTransportadora creates a new carrier with validations
func (s *CarrierService) CriarTransportadora(carrier *models.Carrier) error {
	// Validate required fields
	if carrier.CompanyID == uuid.Nil {
		return errors.New("company_id é obrigatório")
	}
	
	if carrier.Name == "" {
		return errors.New("nome/razão social é obrigatório")
	}
	
	if carrier.Document == "" {
		return errors.New("documento (CPF/CNPJ) é obrigatório")
	}
	
	// Clean and validate document
	carrier.Document = validators.RemoverFormatacao(carrier.Document)
	
	// Try to validate as CPF or CNPJ
	errCPF := validators.ValidarCPF(carrier.Document)
	errCNPJ := validators.ValidarCNPJ(carrier.Document)
	
	if errCPF != nil && errCNPJ != nil {
		return errors.New("documento inválido (deve ser CPF ou CNPJ válido)")
	}
	
	// Validate vehicle plate if provided
	if carrier.VehiclePlate != "" {
		carrier.VehiclePlate = strings.ToUpper(strings.ReplaceAll(carrier.VehiclePlate, "-", ""))
		if err := ValidarPlacaVeiculo(carrier.VehiclePlate); err != nil {
			return err
		}
	}
	
	// Validate vehicle state if provided
	if carrier.VehicleState != "" {
		carrier.VehicleState = strings.ToUpper(strings.TrimSpace(carrier.VehicleState))
		if err := validators.ValidarUF(carrier.VehicleState); err != nil {
			return err
		}
	}
	
	// Validate state if provided
	if carrier.State != "" {
		carrier.State = strings.ToUpper(strings.TrimSpace(carrier.State))
		if err := validators.ValidarUF(carrier.State); err != nil {
			return err
		}
	}
	
	// Validate zip code if provided
	if carrier.ZipCode != "" {
		carrier.ZipCode = validators.RemoverFormatacao(carrier.ZipCode)
		if err := validators.ValidarCEP(carrier.ZipCode); err != nil {
			return err
		}
	}
	
	// Create carrier
	return s.repo.Create(carrier)
}

// ObterTransportadora gets a carrier by ID
func (s *CarrierService) ObterTransportadora(id uuid.UUID) (*models.Carrier, error) {
	return s.repo.FindByID(id)
}

// ListarTransportadoras lists all carriers of a company
func (s *CarrierService) ListarTransportadoras(companyID uuid.UUID, activeOnly bool) ([]models.Carrier, error) {
	return s.repo.ListByCompany(companyID, activeOnly)
}

// AtualizarTransportadora updates a carrier with validations
func (s *CarrierService) AtualizarTransportadora(carrier *models.Carrier) error {
	// Validate required fields
	if carrier.ID == uuid.Nil {
		return errors.New("ID é obrigatório")
	}
	
	if carrier.Name == "" {
		return errors.New("nome/razão social é obrigatório")
	}
	
	if carrier.Document == "" {
		return errors.New("documento (CPF/CNPJ) é obrigatório")
	}
	
	// Clean and validate document
	carrier.Document = validators.RemoverFormatacao(carrier.Document)
	
	// Try to validate as CPF or CNPJ
	errCPF := validators.ValidarCPF(carrier.Document)
	errCNPJ := validators.ValidarCNPJ(carrier.Document)
	
	if errCPF != nil && errCNPJ != nil {
		return errors.New("documento inválido (deve ser CPF ou CNPJ válido)")
	}
	
	// Validate vehicle plate if provided
	if carrier.VehiclePlate != "" {
		carrier.VehiclePlate = strings.ToUpper(strings.ReplaceAll(carrier.VehiclePlate, "-", ""))
		if err := ValidarPlacaVeiculo(carrier.VehiclePlate); err != nil {
			return err
		}
	}
	
	// Validate vehicle state if provided
	if carrier.VehicleState != "" {
		carrier.VehicleState = strings.ToUpper(strings.TrimSpace(carrier.VehicleState))
		if err := validators.ValidarUF(carrier.VehicleState); err != nil {
			return err
		}
	}
	
	// Validate state if provided
	if carrier.State != "" {
		carrier.State = strings.ToUpper(strings.TrimSpace(carrier.State))
		if err := validators.ValidarUF(carrier.State); err != nil {
			return err
		}
	}
	
	// Validate zip code if provided
	if carrier.ZipCode != "" {
		carrier.ZipCode = validators.RemoverFormatacao(carrier.ZipCode)
		if err := validators.ValidarCEP(carrier.ZipCode); err != nil {
			return err
		}
	}
	
	// Update carrier
	return s.repo.Update(carrier)
}

// DeletarTransportadora soft deletes a carrier
func (s *CarrierService) DeletarTransportadora(id uuid.UUID) error {
	return s.repo.Delete(id)
}

// PesquisarTransportadoras searches carriers by name or document
func (s *CarrierService) PesquisarTransportadoras(companyID uuid.UUID, term string, limit int) ([]models.Carrier, error) {
	return s.repo.Search(companyID, term, limit)
}

