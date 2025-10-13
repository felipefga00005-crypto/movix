// ============================================
// CLIENTE REPOSITORY
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

type clienteRepository struct {
	*baseRepository[models.Cliente]
}

// NewClienteRepository cria uma nova instância do repository de clientes
func NewClienteRepository(db *gorm.DB) ClienteRepository {
	return &clienteRepository{
		baseRepository: newBaseRepository[models.Cliente](db),
	}
}

// ============================================
// MÉTODOS ESPECÍFICOS
// ============================================

// GetByCPF busca cliente por CPF
func (r *clienteRepository) GetByCPF(cpf string) (*models.Cliente, error) {
	var cliente models.Cliente
	if err := r.db.Where("cpf = ?", cpf).First(&cliente).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cliente não encontrado")
		}
		return nil, err
	}
	return &cliente, nil
}

// GetByEmail busca cliente por email
func (r *clienteRepository) GetByEmail(email string) (*models.Cliente, error) {
	var cliente models.Cliente
	if err := r.db.Where("email = ?", email).First(&cliente).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cliente não encontrado")
		}
		return nil, err
	}
	return &cliente, nil
}

// GetByStatus busca clientes por status
func (r *clienteRepository) GetByStatus(status string) ([]models.Cliente, error) {
	var clientes []models.Cliente
	if err := r.db.Where("status = ?", status).Order("data_cadastro DESC").Find(&clientes).Error; err != nil {
		return nil, err
	}
	return clientes, nil
}

// Search busca clientes por nome, email ou CPF
func (r *clienteRepository) Search(query string) ([]models.Cliente, error) {
	var clientes []models.Cliente
	searchPattern := "%" + query + "%"
	
	if err := r.db.Where("nome ILIKE ? OR email ILIKE ? OR cpf ILIKE ?", searchPattern, searchPattern, searchPattern).
		Order("data_cadastro DESC").
		Find(&clientes).Error; err != nil {
		return nil, err
	}
	return clientes, nil
}

// GetStats retorna estatísticas dos clientes
func (r *clienteRepository) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Total de clientes
	var total int64
	r.db.Model(&models.Cliente{}).Count(&total)
	stats["total"] = total
	
	// Clientes ativos
	var ativos int64
	r.db.Model(&models.Cliente{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos
	
	// Clientes inativos
	var inativos int64
	r.db.Model(&models.Cliente{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos
	
	// Estatísticas por tipo de contato
	var tipoStats []struct {
		TipoContato string
		Count       int64
	}
	r.db.Model(&models.Cliente{}).Select("tipo_contato, count(*) as count").Group("tipo_contato").Scan(&tipoStats)
	
	tipoMap := make(map[string]int64)
	for _, stat := range tipoStats {
		tipoMap[stat.TipoContato] = stat.Count
	}
	stats["porTipo"] = tipoMap
	
	return stats, nil
}

// ============================================
// CAMPOS PERSONALIZADOS
// ============================================

// CreateCampoPersonalizado cria um campo personalizado
func (r *clienteRepository) CreateCampoPersonalizado(campo *models.ClienteCampoPersonalizado) error {
	if err := r.db.Create(campo).Error; err != nil {
		return err
	}
	return nil
}

// GetCamposPersonalizados busca campos personalizados de um cliente
func (r *clienteRepository) GetCamposPersonalizados(clienteID uint) ([]models.ClienteCampoPersonalizado, error) {
	var campos []models.ClienteCampoPersonalizado
	if err := r.db.Where("cliente_id = ?", clienteID).Order("ordem ASC").Find(&campos).Error; err != nil {
		return nil, err
	}
	return campos, nil
}

// DeleteCamposPersonalizados remove todos os campos personalizados de um cliente
func (r *clienteRepository) DeleteCamposPersonalizados(clienteID uint) error {
	if err := r.db.Where("cliente_id = ?", clienteID).Delete(&models.ClienteCampoPersonalizado{}).Error; err != nil {
		return err
	}
	return nil
}
