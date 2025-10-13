package services

import (
	"errors"

	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
)

type ProdutoService struct {
	repo repositories.ProdutoRepository
}

func NewProdutoService(repo repositories.ProdutoRepository) *ProdutoService {
	return &ProdutoService{
		repo: repo,
	}
}

func (s *ProdutoService) GetAll() ([]models.Produto, error) {
	return s.repo.GetAll()
}

func (s *ProdutoService) GetByID(id uint) (*models.Produto, error) {
	return s.repo.GetByID(id)
}

func (s *ProdutoService) Create(req *models.CreateProdutoRequest) (*models.Produto, error) {
	// Verifica se o código já existe
	if existingProduto, _ := s.repo.GetByCodigo(req.Codigo); existingProduto != nil {
		return nil, errors.New("código já cadastrado")
	}

	produto := &models.Produto{
		Nome:          req.Nome,
		Codigo:        req.Codigo,
		Categoria:     req.Categoria,
		Marca:         req.Marca,
		Preco:         req.Preco,
		PrecoCusto:    req.PrecoCusto,
		Estoque:       req.Estoque,
		EstoqueMinimo: req.EstoqueMinimo,
		Status:        req.Status,
	}

	if err := s.repo.Create(produto); err != nil {
		return nil, err
	}

	return produto, nil
}

func (s *ProdutoService) Update(id uint, req *models.UpdateProdutoRequest) (*models.Produto, error) {
	produto, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Atualiza os campos fornecidos
	if req.Nome != "" {
		produto.Nome = req.Nome
	}
	if req.Preco != 0 {
		produto.Preco = req.Preco
	}
	if req.Estoque != 0 {
		produto.Estoque = req.Estoque
	}
	if req.Status != "" {
		produto.Status = req.Status
	}

	if err := s.repo.Update(produto); err != nil {
		return nil, err
	}

	return produto, nil
}

func (s *ProdutoService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func (s *ProdutoService) GetByStatus(status string) ([]models.Produto, error) {
	return s.repo.GetByStatus(status)
}

func (s *ProdutoService) GetByCategoria(categoria string) ([]models.Produto, error) {
	return s.repo.GetByCategoria(categoria)
}

func (s *ProdutoService) GetEstoqueBaixo() ([]models.Produto, error) {
	return s.repo.GetEstoqueBaixo()
}

func (s *ProdutoService) Search(query string) ([]models.Produto, error) {
	return s.repo.Search(query)
}

func (s *ProdutoService) UpdateEstoque(id uint, novoEstoque int) error {
	return s.repo.UpdateEstoque(id, novoEstoque)
}

func (s *ProdutoService) GetStats() (map[string]interface{}, error) {
	return s.repo.GetStats()
}
