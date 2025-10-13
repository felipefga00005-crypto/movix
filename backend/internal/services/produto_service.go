package services

import (
	"errors"

	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type ProdutoService struct {
	db *gorm.DB
}

func NewProdutoService() *ProdutoService {
	return &ProdutoService{
		db: database.GetDB(),
	}
}

func (s *ProdutoService) GetAll() ([]models.Produto, error) {
	var produtos []models.Produto
	
	if err := s.db.Order("data_cadastro DESC").Find(&produtos).Error; err != nil {
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

func (s *ProdutoService) Create(req *models.CreateProdutoRequest) (*models.Produto, error) {
	// Verifica se o código já existe (se fornecido)
	if req.Codigo != "" {
		var existingProduto models.Produto
		if err := s.db.Where("codigo = ?", req.Codigo).First(&existingProduto).Error; err == nil {
			return nil, errors.New("código já cadastrado")
		}
	}
	
	produto := &models.Produto{
		Nome:          req.Nome,
		Codigo:        req.Codigo,
		Categoria:     req.Categoria,
		Subcategoria:  req.Subcategoria,
		Marca:         req.Marca,
		Modelo:        req.Modelo,
		Preco:         req.Preco,
		PrecoCusto:    req.PrecoCusto,
		Estoque:       req.Estoque,
		EstoqueMinimo: req.EstoqueMinimo,
		Unidade:       req.Unidade,
		Status:        req.Status,
		Fornecedor:    req.Fornecedor,
		Descricao:     req.Descricao,
		Peso:          req.Peso,
		Dimensoes:     req.Dimensoes,
		Garantia:      req.Garantia,
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
	
	updates := make(map[string]interface{})
	
	if req.Nome != "" {
		updates["nome"] = req.Nome
	}
	if req.Categoria != "" {
		updates["categoria"] = req.Categoria
	}
	if req.Subcategoria != "" {
		updates["subcategoria"] = req.Subcategoria
	}
	if req.Marca != "" {
		updates["marca"] = req.Marca
	}
	if req.Modelo != "" {
		updates["modelo"] = req.Modelo
	}
	if req.Preco > 0 {
		updates["preco"] = req.Preco
	}
	if req.PrecoCusto > 0 {
		updates["preco_custo"] = req.PrecoCusto
	}
	if req.Estoque >= 0 {
		updates["estoque"] = req.Estoque
	}
	if req.EstoqueMinimo >= 0 {
		updates["estoque_minimo"] = req.EstoqueMinimo
	}
	if req.Unidade != "" {
		updates["unidade"] = req.Unidade
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.Fornecedor != "" {
		updates["fornecedor"] = req.Fornecedor
	}
	if req.Descricao != "" {
		updates["descricao"] = req.Descricao
	}
	if req.Peso != "" {
		updates["peso"] = req.Peso
	}
	if req.Dimensoes != "" {
		updates["dimensoes"] = req.Dimensoes
	}
	if req.Garantia != "" {
		updates["garantia"] = req.Garantia
	}
	
	if err := s.db.Model(produto).Updates(updates).Error; err != nil {
		return nil, err
	}
	
	return produto, nil
}

func (s *ProdutoService) Delete(id uint) error {
	produto, err := s.GetByID(id)
	if err != nil {
		return err
	}
	
	if err := s.db.Delete(produto).Error; err != nil {
		return err
	}
	
	return nil
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

func (s *ProdutoService) UpdateEstoque(id uint, req *models.UpdateEstoqueRequest) (*models.Produto, error) {
	produto, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}
	
	switch req.Operacao {
	case "adicionar":
		produto.Estoque += req.Quantidade
	case "remover":
		if produto.Estoque < req.Quantidade {
			return nil, errors.New("estoque insuficiente")
		}
		produto.Estoque -= req.Quantidade
	case "ajustar":
		produto.Estoque = req.Quantidade
	default:
		return nil, errors.New("operação inválida. Use: adicionar, remover ou ajustar")
	}
	
	if err := s.db.Save(produto).Error; err != nil {
		return nil, err
	}
	
	return produto, nil
}

func (s *ProdutoService) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	var total int64
	s.db.Model(&models.Produto{}).Count(&total)
	stats["total"] = total
	
	var ativos int64
	s.db.Model(&models.Produto{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos
	
	var inativos int64
	s.db.Model(&models.Produto{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos
	
	var estoqueBaixo int64
	s.db.Model(&models.Produto{}).Where("estoque <= estoqueMinimo").Count(&estoqueBaixo)
	stats["estoqueBaixo"] = estoqueBaixo
	
	var categoriaStats []struct {
		Categoria string
		Count     int64
	}
	s.db.Model(&models.Produto{}).Select("categoria, count(*) as count").Group("categoria").Scan(&categoriaStats)
	stats["porCategoria"] = categoriaStats
	
	var valorTotal float64
	s.db.Model(&models.Produto{}).Select("SUM(preco * estoque)").Scan(&valorTotal)
	stats["valorTotalEstoque"] = valorTotal
	
	return stats, nil
}

