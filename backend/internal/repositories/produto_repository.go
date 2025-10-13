// ============================================
// PRODUTO REPOSITORY
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

type produtoRepository struct {
	*baseRepository[models.Produto]
}

// NewProdutoRepository cria uma nova instância do repository de produtos
func NewProdutoRepository(db *gorm.DB) ProdutoRepository {
	return &produtoRepository{
		baseRepository: newBaseRepository[models.Produto](db),
	}
}

// ============================================
// MÉTODOS ESPECÍFICOS
// ============================================

// GetByCodigo busca produto por código
func (r *produtoRepository) GetByCodigo(codigo string) (*models.Produto, error) {
	var produto models.Produto
	if err := r.db.Where("codigo = ?", codigo).First(&produto).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("produto não encontrado")
		}
		return nil, err
	}
	return &produto, nil
}

// GetByStatus busca produtos por status
func (r *produtoRepository) GetByStatus(status string) ([]models.Produto, error) {
	var produtos []models.Produto
	if err := r.db.Where("status = ?", status).Order("data_cadastro DESC").Find(&produtos).Error; err != nil {
		return nil, err
	}
	return produtos, nil
}

// GetByCategoria busca produtos por categoria
func (r *produtoRepository) GetByCategoria(categoria string) ([]models.Produto, error) {
	var produtos []models.Produto
	if err := r.db.Where("categoria = ?", categoria).Order("data_cadastro DESC").Find(&produtos).Error; err != nil {
		return nil, err
	}
	return produtos, nil
}

// GetEstoqueBaixo busca produtos com estoque baixo
func (r *produtoRepository) GetEstoqueBaixo() ([]models.Produto, error) {
	var produtos []models.Produto
	if err := r.db.Where("estoque <= estoque_minimo").Order("estoque ASC").Find(&produtos).Error; err != nil {
		return nil, err
	}
	return produtos, nil
}

// Search busca produtos por nome, código ou marca
func (r *produtoRepository) Search(query string) ([]models.Produto, error) {
	var produtos []models.Produto
	searchPattern := "%" + query + "%"
	
	if err := r.db.Where("nome ILIKE ? OR codigo ILIKE ? OR marca ILIKE ?", searchPattern, searchPattern, searchPattern).
		Order("data_cadastro DESC").
		Find(&produtos).Error; err != nil {
		return nil, err
	}
	return produtos, nil
}

// UpdateEstoque atualiza o estoque de um produto
func (r *produtoRepository) UpdateEstoque(id uint, novoEstoque int) error {
	if err := r.db.Model(&models.Produto{}).Where("id = ?", id).Update("estoque", novoEstoque).Error; err != nil {
		return err
	}
	return nil
}

// GetStats retorna estatísticas dos produtos
func (r *produtoRepository) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Total de produtos
	var total int64
	r.db.Model(&models.Produto{}).Count(&total)
	stats["total"] = total
	
	// Produtos ativos
	var ativos int64
	r.db.Model(&models.Produto{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos
	
	// Produtos inativos
	var inativos int64
	r.db.Model(&models.Produto{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos
	
	// Produtos com estoque baixo
	var estoqueBaixo int64
	r.db.Model(&models.Produto{}).Where("estoque <= estoque_minimo").Count(&estoqueBaixo)
	stats["estoqueBaixo"] = estoqueBaixo
	
	// Estatísticas por categoria
	var categoriaStats []struct {
		Categoria string
		Count     int64
	}
	r.db.Model(&models.Produto{}).Select("categoria, count(*) as count").Group("categoria").Scan(&categoriaStats)
	
	categoriaMap := make(map[string]int64)
	for _, stat := range categoriaStats {
		categoriaMap[stat.Categoria] = stat.Count
	}
	stats["porCategoria"] = categoriaMap
	
	// Valor total do estoque
	var valorTotal float64
	r.db.Model(&models.Produto{}).Select("SUM(preco * estoque)").Scan(&valorTotal)
	stats["valorTotalEstoque"] = valorTotal
	
	// Valor total do custo
	var custoTotal float64
	r.db.Model(&models.Produto{}).Select("SUM(preco_custo * estoque)").Scan(&custoTotal)
	stats["custoTotalEstoque"] = custoTotal
	
	return stats, nil
}
