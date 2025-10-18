package services

import (
	"errors"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type ProdutoService struct {
	db *gorm.DB
}

func NewProdutoService(db *gorm.DB) *ProdutoService {
	return &ProdutoService{
		db: db,
	}
}

func (s *ProdutoService) GetAll() ([]models.Produto, error) {
	var produtos []models.Produto
	if err := s.db.Find(&produtos).Error; err != nil {
		return nil, err
	}
	return produtos, nil
}

func (s *ProdutoService) GetByID(id uint) (*models.Produto, error) {
	var produto models.Produto
	if err := s.db.First(&produto, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("produto não encontrado")
		}
		return nil, err
	}
	return &produto, nil
}

func (s *ProdutoService) GetByCodigo(codigo string) (*models.Produto, error) {
	var produto models.Produto
	if err := s.db.Where("codigo = ?", codigo).First(&produto).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &produto, nil
}

func (s *ProdutoService) Create(req *models.CreateProdutoRequest) (*models.Produto, error) {
	// Verifica se o código já existe
	if existingProduto, _ := s.GetByCodigo(req.Codigo); existingProduto != nil {
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

	if err := s.db.Create(produto).Error; err != nil {
		return nil, err
	}

	return produto, nil
}

func (s *ProdutoService) Update(id uint, req *models.UpdateProdutoRequest) (*models.Produto, error) {
	produto, err := s.GetByID(id)
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

	if err := s.db.Save(produto).Error; err != nil {
		return nil, err
	}

	return produto, nil
}

func (s *ProdutoService) Delete(id uint) error {
	return s.db.Delete(&models.Produto{}, id).Error
}

func (s *ProdutoService) GetByStatus(status string) ([]models.Produto, error) {
	var produtos []models.Produto
	if err := s.db.Where("status = ?", status).Order("data_cadastro DESC").Find(&produtos).Error; err != nil {
		return nil, err
	}
	return produtos, nil
}

func (s *ProdutoService) GetByCategoria(categoria string) ([]models.Produto, error) {
	var produtos []models.Produto
	if err := s.db.Where("categoria = ?", categoria).Order("data_cadastro DESC").Find(&produtos).Error; err != nil {
		return nil, err
	}
	return produtos, nil
}

func (s *ProdutoService) GetEstoqueBaixo() ([]models.Produto, error) {
	var produtos []models.Produto
	if err := s.db.Where("estoque <= estoque_minimo").Order("estoque ASC").Find(&produtos).Error; err != nil {
		return nil, err
	}
	return produtos, nil
}

func (s *ProdutoService) Search(query string) ([]models.Produto, error) {
	var produtos []models.Produto
	searchPattern := "%" + query + "%"

	if err := s.db.Where("nome ILIKE ? OR codigo ILIKE ? OR marca ILIKE ?", searchPattern, searchPattern, searchPattern).
		Order("data_cadastro DESC").
		Find(&produtos).Error; err != nil {
		return nil, err
	}
	return produtos, nil
}

func (s *ProdutoService) UpdateEstoque(id uint, novoEstoque int) error {
	return s.db.Model(&models.Produto{}).Where("id = ?", id).Update("estoque", novoEstoque).Error
}

func (s *ProdutoService) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total de produtos
	var total int64
	s.db.Model(&models.Produto{}).Count(&total)
	stats["total"] = total

	// Produtos ativos
	var ativos int64
	s.db.Model(&models.Produto{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos

	// Produtos inativos
	var inativos int64
	s.db.Model(&models.Produto{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos

	// Produtos com estoque baixo
	var estoqueBaixo int64
	s.db.Model(&models.Produto{}).Where("estoque <= estoque_minimo").Count(&estoqueBaixo)
	stats["estoqueBaixo"] = estoqueBaixo

	return stats, nil
}

// GetCategorias retorna lista única de categorias
func (s *ProdutoService) GetCategorias() ([]string, error) {
	var categorias []string
	if err := s.db.Model(&models.Produto{}).
		Distinct("categoria").
		Where("categoria IS NOT NULL AND categoria != ''").
		Pluck("categoria", &categorias).Error; err != nil {
		return nil, err
	}
	return categorias, nil
}

// GetMarcas retorna lista única de marcas
func (s *ProdutoService) GetMarcas() ([]string, error) {
	var marcas []string
	if err := s.db.Model(&models.Produto{}).
		Distinct("marca").
		Where("marca IS NOT NULL AND marca != ''").
		Pluck("marca", &marcas).Error; err != nil {
		return nil, err
	}
	return marcas, nil
}

// GetFornecedores retorna lista única de fornecedores principais
func (s *ProdutoService) GetFornecedores() ([]string, error) {
	var fornecedores []string
	if err := s.db.Model(&models.Produto{}).
		Distinct("fornecedor_principal").
		Where("fornecedor_principal IS NOT NULL AND fornecedor_principal != ''").
		Pluck("fornecedor_principal", &fornecedores).Error; err != nil {
		return nil, err
	}
	return fornecedores, nil
}

// GetSemEstoque retorna produtos sem estoque
func (s *ProdutoService) GetSemEstoque() ([]models.Produto, error) {
	var produtos []models.Produto
	if err := s.db.Where("estoque <= 0").Find(&produtos).Error; err != nil {
		return nil, err
	}
	return produtos, nil
}

// BulkActivate ativa múltiplos produtos
func (s *ProdutoService) BulkActivate(ids []uint) error {
	return s.db.Model(&models.Produto{}).Where("id IN ?", ids).Update("ativo", true).Error
}

// BulkDeactivate inativa múltiplos produtos
func (s *ProdutoService) BulkDeactivate(ids []uint) error {
	return s.db.Model(&models.Produto{}).Where("id IN ?", ids).Update("ativo", false).Error
}

// BulkDelete exclui múltiplos produtos
func (s *ProdutoService) BulkDelete(ids []uint) error {
	return s.db.Where("id IN ?", ids).Delete(&models.Produto{}).Error
}

// SetDestaque define se um produto está em destaque
func (s *ProdutoService) SetDestaque(id uint, destaque bool) error {
	return s.db.Model(&models.Produto{}).Where("id = ?", id).Update("destaque", destaque).Error
}

// SetPromocao define se um produto está em promoção
func (s *ProdutoService) SetPromocao(id uint, promocao bool) error {
	return s.db.Model(&models.Produto{}).Where("id = ?", id).Update("promocao", promocao).Error
}
