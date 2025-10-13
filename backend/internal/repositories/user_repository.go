// ============================================
// USER REPOSITORY
// ============================================

package repositories

import (
	"errors"
	"time"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// ============================================
// IMPLEMENTAÇÃO
// ============================================

type userRepository struct {
	*baseRepository[models.User]
}

// NewUserRepository cria uma nova instância do repository de usuários
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{
		baseRepository: newBaseRepository[models.User](db),
	}
}

// ============================================
// MÉTODOS ESPECÍFICOS
// ============================================

// GetByEmail busca usuário por email
func (r *userRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("usuário não encontrado")
		}
		return nil, err
	}
	return &user, nil
}

// GetByCodigo busca usuário por código
func (r *userRepository) GetByCodigo(codigo string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("codigo = ?", codigo).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("usuário não encontrado")
		}
		return nil, err
	}
	return &user, nil
}

// GetByStatus busca usuários por status
func (r *userRepository) GetByStatus(status string) ([]models.User, error) {
	var users []models.User
	if err := r.db.Where("status = ?", status).Order("data_cadastro DESC").Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// GetByPerfil busca usuários por perfil
func (r *userRepository) GetByPerfil(perfil string) ([]models.User, error) {
	var users []models.User
	if err := r.db.Where("perfil = ?", perfil).Order("data_cadastro DESC").Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// Search busca usuários por nome ou email
func (r *userRepository) Search(query string) ([]models.User, error) {
	var users []models.User
	searchPattern := "%" + query + "%"
	
	if err := r.db.Where("nome ILIKE ? OR email ILIKE ?", searchPattern, searchPattern).
		Order("data_cadastro DESC").
		Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// UpdatePassword atualiza a senha do usuário
func (r *userRepository) UpdatePassword(id uint, hashedPassword string) error {
	if err := r.db.Model(&models.User{}).Where("id = ?", id).Update("senha", hashedPassword).Error; err != nil {
		return err
	}
	return nil
}

// UpdateLastAccess atualiza o último acesso do usuário
func (r *userRepository) UpdateLastAccess(id uint) error {
	now := time.Now()
	if err := r.db.Model(&models.User{}).Where("id = ?", id).Update("ultimo_acesso", &now).Error; err != nil {
		return err
	}
	return nil
}

// GetStats retorna estatísticas dos usuários
func (r *userRepository) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Total de usuários
	var total int64
	r.db.Model(&models.User{}).Count(&total)
	stats["total"] = total
	
	// Usuários ativos
	var ativos int64
	r.db.Model(&models.User{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos
	
	// Usuários inativos
	var inativos int64
	r.db.Model(&models.User{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos
	
	// Usuários pendentes
	var pendentes int64
	r.db.Model(&models.User{}).Where("status = ?", "Pendente").Count(&pendentes)
	stats["pendentes"] = pendentes
	
	// Estatísticas por perfil
	var perfilStats []struct {
		Perfil string
		Count  int64
	}
	r.db.Model(&models.User{}).Select("perfil, count(*) as count").Group("perfil").Scan(&perfilStats)
	
	perfilMap := make(map[string]int64)
	for _, stat := range perfilStats {
		perfilMap[stat.Perfil] = stat.Count
	}
	stats["porPerfil"] = perfilMap
	
	return stats, nil
}
