package services

import (
	"errors"

	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type FornecedorService struct {
	db *gorm.DB
}

func NewFornecedorService() *FornecedorService {
	return &FornecedorService{
		db: database.GetDB(),
	}
}

func (s *FornecedorService) GetAll() ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	
	if err := s.db.Order("data_cadastro DESC").Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	
	return fornecedores, nil
}

func (s *FornecedorService) GetByID(id uint) (*models.Fornecedor, error) {
	var fornecedor models.Fornecedor
	
	if err := s.db.First(&fornecedor, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("fornecedor não encontrado")
		}
		return nil, err
	}
	
	return &fornecedor, nil
}

func (s *FornecedorService) Create(req *models.CreateFornecedorRequest) (*models.Fornecedor, error) {
	// Verifica se o CNPJ já existe
	var existingFornecedor models.Fornecedor
	if err := s.db.Where("cnpj = ?", req.CNPJ).First(&existingFornecedor).Error; err == nil {
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
		Contato:      req.Contato,
	}
	
	if err := s.db.Create(fornecedor).Error; err != nil {
		return nil, err
	}
	
	return fornecedor, nil
}

func (s *FornecedorService) Update(id uint, req *models.UpdateFornecedorRequest) (*models.Fornecedor, error) {
	fornecedor, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}
	
	updates := make(map[string]interface{})
	
	if req.RazaoSocial != "" {
		updates["razao_social"] = req.RazaoSocial
	}
	if req.NomeFantasia != "" {
		updates["nome_fantasia"] = req.NomeFantasia
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Telefone != "" {
		updates["telefone"] = req.Telefone
	}
	if req.Endereco != "" {
		updates["endereco"] = req.Endereco
	}
	if req.Cidade != "" {
		updates["cidade"] = req.Cidade
	}
	if req.UF != "" {
		updates["uf"] = req.UF
	}
	if req.CEP != "" {
		updates["cep"] = req.CEP
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.Categoria != "" {
		updates["categoria"] = req.Categoria
	}
	if req.Contato != "" {
		updates["contato"] = req.Contato
	}
	
	if err := s.db.Model(fornecedor).Updates(updates).Error; err != nil {
		return nil, err
	}
	
	return fornecedor, nil
}

func (s *FornecedorService) Delete(id uint) error {
	fornecedor, err := s.GetByID(id)
	if err != nil {
		return err
	}
	
	if err := s.db.Delete(fornecedor).Error; err != nil {
		return err
	}
	
	return nil
}

func (s *FornecedorService) GetByStatus(status string) ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	
	if err := s.db.Where("status = ?", status).Order("data_cadastro DESC").Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	
	return fornecedores, nil
}

func (s *FornecedorService) GetByCategoria(categoria string) ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	
	if err := s.db.Where("categoria = ?", categoria).Order("data_cadastro DESC").Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	
	return fornecedores, nil
}

func (s *FornecedorService) Search(query string) ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	
	searchPattern := "%" + query + "%"
	
	if err := s.db.Where("razao_social ILIKE ? OR nome_fantasia ILIKE ? OR cnpj ILIKE ?", searchPattern, searchPattern, searchPattern).
		Order("data_cadastro DESC").
		Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	
	return fornecedores, nil
}

func (s *FornecedorService) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	var total int64
	s.db.Model(&models.Fornecedor{}).Count(&total)
	stats["total"] = total
	
	var ativos int64
	s.db.Model(&models.Fornecedor{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos
	
	var inativos int64
	s.db.Model(&models.Fornecedor{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos
	
	var pendentes int64
	s.db.Model(&models.Fornecedor{}).Where("status = ?", "Pendente").Count(&pendentes)
	stats["pendentes"] = pendentes
	
	var categoriaStats []struct {
		Categoria string
		Count     int64
	}
	s.db.Model(&models.Fornecedor{}).Select("categoria, count(*) as count").Group("categoria").Scan(&categoriaStats)
	stats["porCategoria"] = categoriaStats
	
	return stats, nil
}

