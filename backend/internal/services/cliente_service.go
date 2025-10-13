package services

import (
	"errors"

	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
)

type ClienteService struct {
	repo repositories.ClienteRepository
}

func NewClienteService(repo repositories.ClienteRepository) *ClienteService {
	return &ClienteService{
		repo: repo,
	}
}

// GetAll retorna todos os clientes
func (s *ClienteService) GetAll() ([]models.Cliente, error) {
	return s.repo.GetAll()
}

// GetByID retorna um cliente por ID
func (s *ClienteService) GetByID(id uint) (*models.Cliente, error) {
	cliente, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	
	// Carrega campos personalizados
	campos, err := s.repo.GetCamposPersonalizados(cliente.ID)
	if err != nil {
		return nil, err
	}
	cliente.CamposPersonalizados = campos
	
	return cliente, nil
}

// Create cria um novo cliente
func (s *ClienteService) Create(req *models.CreateClienteRequest) (*models.Cliente, error) {
	// Verifica se o CPF já existe
	if existingCliente, _ := s.repo.GetByCPF(req.CPF); existingCliente != nil {
		return nil, errors.New("CPF já cadastrado")
	}

	cliente := &models.Cliente{
		CPF:         req.CPF,
		Nome:        req.Nome,
		Email:       req.Email,
		TelefoneFixo: req.TelefoneFixo,
		Endereco:    req.Endereco,
		Cidade:      req.Cidade,
		Estado:      req.Estado,
		CEP:         req.CEP,
		Status:      req.Status,
	}

	if err := s.repo.Create(cliente); err != nil {
		return nil, err
	}

	// Processar campos personalizados se fornecidos
	if len(req.CamposPersonalizados) > 0 {
		for _, campo := range req.CamposPersonalizados {
			campoPersonalizado := &models.ClienteCampoPersonalizado{
				ClienteID: cliente.ID,
				Nome:      campo.Nome,
				Valor:     campo.Valor,
				Ordem:     campo.Ordem,
			}
			if err := s.repo.CreateCampoPersonalizado(campoPersonalizado); err != nil {
				return nil, err
			}
		}
	}
	
	return cliente, nil
}

// Update atualiza um cliente
func (s *ClienteService) Update(id uint, req *models.UpdateClienteRequest) (*models.Cliente, error) {
	cliente, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Atualiza os campos fornecidos
	if req.CPF != "" {
		cliente.CPF = req.CPF
	}
	if req.Nome != "" {
		cliente.Nome = req.Nome
	}
	if req.Email != "" {
		cliente.Email = req.Email
	}
	if req.Status != "" {
		cliente.Status = req.Status
	}

	if err := s.repo.Update(cliente); err != nil {
		return nil, err
	}

	return cliente, nil
}

// Delete remove um cliente
func (s *ClienteService) Delete(id uint) error {
	return s.repo.Delete(id)
}

// GetByStatus retorna clientes por status
func (s *ClienteService) GetByStatus(status string) ([]models.Cliente, error) {
	return s.repo.GetByStatus(status)
}

// Search busca clientes
func (s *ClienteService) Search(query string) ([]models.Cliente, error) {
	return s.repo.Search(query)
}

// GetStats retorna estatísticas dos clientes
func (s *ClienteService) GetStats() (map[string]interface{}, error) {
	return s.repo.GetStats()
}
