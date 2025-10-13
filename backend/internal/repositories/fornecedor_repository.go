// ============================================
// FORNECEDOR REPOSITORY
// ============================================

package repositories

import (
	"errors"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// ============================================
// IMPLEMENTAÇÃO
// ============================================

type fornecedorRepository struct {
	*baseRepository[models.Fornecedor]
}

// NewFornecedorRepository cria uma nova instância do repository de fornecedores
func NewFornecedorRepository(db *gorm.DB) FornecedorRepository {
	return &fornecedorRepository{
		baseRepository: newBaseRepository[models.Fornecedor](db),
	}
}

// ============================================
// MÉTODOS ESPECÍFICOS
// ============================================

// GetByCNPJ busca fornecedor por CNPJ
func (r *fornecedorRepository) GetByCNPJ(cnpj string) (*models.Fornecedor, error) {
	var fornecedor models.Fornecedor
	if err := r.db.Where("cnpj = ?", cnpj).First(&fornecedor).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("fornecedor não encontrado")
		}
		return nil, err
	}
	return &fornecedor, nil
}

// GetByCodigo busca fornecedor por código
func (r *fornecedorRepository) GetByCodigo(codigo string) (*models.Fornecedor, error) {
	var fornecedor models.Fornecedor
	if err := r.db.Where("codigo = ?", codigo).First(&fornecedor).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("fornecedor não encontrado")
		}
		return nil, err
	}
	return &fornecedor, nil
}

// GetByStatus busca fornecedores por status
func (r *fornecedorRepository) GetByStatus(status string) ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	if err := r.db.Where("status = ?", status).Order("data_cadastro DESC").Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	return fornecedores, nil
}

// GetByCategoria busca fornecedores por categoria
func (r *fornecedorRepository) GetByCategoria(categoria string) ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	if err := r.db.Where("categoria = ?", categoria).Order("data_cadastro DESC").Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	return fornecedores, nil
}

// Search busca fornecedores por razão social, nome fantasia ou CNPJ
func (r *fornecedorRepository) Search(query string) ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	searchPattern := "%" + query + "%"
	
	if err := r.db.Where("razao_social ILIKE ? OR nome_fantasia ILIKE ? OR cnpj ILIKE ?", searchPattern, searchPattern, searchPattern).
		Order("data_cadastro DESC").
		Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	return fornecedores, nil
}

// GetStats retorna estatísticas dos fornecedores
func (r *fornecedorRepository) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Total de fornecedores
	var total int64
	r.db.Model(&models.Fornecedor{}).Count(&total)
	stats["total"] = total
	
	// Fornecedores ativos
	var ativos int64
	r.db.Model(&models.Fornecedor{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos
	
	// Fornecedores inativos
	var inativos int64
	r.db.Model(&models.Fornecedor{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos
	
	// Estatísticas por categoria
	var categoriaStats []struct {
		Categoria string
		Count     int64
	}
	r.db.Model(&models.Fornecedor{}).Select("categoria, count(*) as count").Group("categoria").Scan(&categoriaStats)
	
	categoriaMap := make(map[string]int64)
	for _, stat := range categoriaStats {
		categoriaMap[stat.Categoria] = stat.Count
	}
	stats["porCategoria"] = categoriaMap
	
	// Estatísticas por UF
	var ufStats []struct {
		UF    string
		Count int64
	}
	r.db.Model(&models.Fornecedor{}).Select("uf, count(*) as count").Group("uf").Scan(&ufStats)
	
	ufMap := make(map[string]int64)
	for _, stat := range ufStats {
		ufMap[stat.UF] = stat.Count
	}
	stats["porUF"] = ufMap
	
	return stats, nil
}
