package services

import (
	"errors"

	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
)

type FornecedorService struct {
	repo repositories.FornecedorRepository
}

func NewFornecedorService(repo repositories.FornecedorRepository) *FornecedorService {
	return &FornecedorService{
		repo: repo,
	}
}

func (s *FornecedorService) GetAll() ([]models.Fornecedor, error) {
	return s.repo.GetAll()
}

func (s *FornecedorService) GetByID(id uint) (*models.Fornecedor, error) {
	return s.repo.GetByID(id)
}

func (s *FornecedorService) Create(req *models.CreateFornecedorRequest) (*models.Fornecedor, error) {
	// Verifica se o CNPJ já existe
	if existingFornecedor, _ := s.repo.GetByCNPJ(req.CNPJ); existingFornecedor != nil {
		return nil, errors.New("CNPJ já cadastrado")
	}

	fornecedor := &models.Fornecedor{
		RazaoSocial:  req.RazaoSocial,
		NomeFantasia: req.NomeFantasia,
		CNPJ:         req.CNPJ,
		Email:        req.Email,
		Telefone:     req.Telefone,
		Endereco:     req.Endereco,
		Cidade:       req.Cidade,
		UF:           req.UF,
		CEP:          req.CEP,
		Status:       req.Status,
		Categoria:    req.Categoria,
	}

	if err := s.repo.Create(fornecedor); err != nil {
		return nil, err
	}

	return fornecedor, nil
}

func (s *FornecedorService) Update(id uint, req *models.UpdateFornecedorRequest) (*models.Fornecedor, error) {
	fornecedor, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Atualiza os campos fornecidos
	if req.RazaoSocial != "" {
		fornecedor.RazaoSocial = req.RazaoSocial
	}
	if req.Email != "" {
		fornecedor.Email = req.Email
	}
	if req.Status != "" {
		fornecedor.Status = req.Status
	}

	if err := s.repo.Update(fornecedor); err != nil {
		return nil, err
	}

	return fornecedor, nil
}

func (s *FornecedorService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func (s *FornecedorService) GetByStatus(status string) ([]models.Fornecedor, error) {
	return s.repo.GetByStatus(status)
}

func (s *FornecedorService) GetByCategoria(categoria string) ([]models.Fornecedor, error) {
	return s.repo.GetByCategoria(categoria)
}

func (s *FornecedorService) Search(query string) ([]models.Fornecedor, error) {
	return s.repo.Search(query)
}

func (s *FornecedorService) GetStats() (map[string]interface{}, error) {
	return s.repo.GetStats()
}
