package services

import (
	"errors"
	"time"

	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService() *UserService {
	return &UserService{
		db: database.GetDB(),
	}
}

// GetAll retorna todos os usuários
func (s *UserService) GetAll() ([]models.User, error) {
	var users []models.User
	
	if err := s.db.Order("data_cadastro DESC").Find(&users).Error; err != nil {
		return nil, err
	}
	
	return users, nil
}

// GetByID retorna um usuário por ID
func (s *UserService) GetByID(id uint) (*models.User, error) {
	var user models.User
	
	if err := s.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("usuário não encontrado")
		}
		return nil, err
	}
	
	return &user, nil
}

// GetByEmail retorna um usuário por email
func (s *UserService) GetByEmail(email string) (*models.User, error) {
	var user models.User
	
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("usuário não encontrado")
		}
		return nil, err
	}
	
	return &user, nil
}

// Create cria um novo usuário
func (s *UserService) Create(req *models.CreateUserRequest) (*models.User, error) {
	// Verifica se o email já existe
	var existingUser models.User
	if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("email já cadastrado")
	}
	
	user := &models.User{
		Nome:         req.Nome,
		Email:        req.Email,
		Senha:        req.Senha, // Será hasheada no BeforeCreate
		Telefone:     req.Telefone,
		Cargo:        req.Cargo,
		Departamento: req.Departamento,
		Perfil:       req.Perfil,
		Status:       req.Status,
	}
	
	// Define valores padrão
	if user.Perfil == "" {
		user.Perfil = "operador"
	}
	if user.Status == "" {
		user.Status = "Ativo"
	}
	
	if err := s.db.Create(user).Error; err != nil {
		return nil, err
	}
	
	return user, nil
}

// Update atualiza um usuário
func (s *UserService) Update(id uint, req *models.UpdateUserRequest) (*models.User, error) {
	user, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}
	
	// Verifica se o email já existe em outro usuário
	if req.Email != "" && req.Email != user.Email {
		var existingUser models.User
		if err := s.db.Where("email = ? AND id != ?", req.Email, id).First(&existingUser).Error; err == nil {
			return nil, errors.New("email já cadastrado")
		}
	}
	
	// Atualiza apenas os campos fornecidos
	updates := make(map[string]interface{})
	
	if req.Nome != "" {
		updates["nome"] = req.Nome
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Telefone != "" {
		updates["telefone"] = req.Telefone
	}
	if req.Cargo != "" {
		updates["cargo"] = req.Cargo
	}
	if req.Departamento != "" {
		updates["departamento"] = req.Departamento
	}
	if req.Perfil != "" {
		updates["perfil"] = req.Perfil
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}
	
	if err := s.db.Model(user).Updates(updates).Error; err != nil {
		return nil, err
	}
	
	return user, nil
}

// Delete deleta um usuário (soft delete)
func (s *UserService) Delete(id uint) error {
	user, err := s.GetByID(id)
	if err != nil {
		return err
	}
	
	if err := s.db.Delete(user).Error; err != nil {
		return err
	}
	
	return nil
}

// ChangePassword altera a senha do usuário
func (s *UserService) ChangePassword(id uint, req *models.ChangePasswordRequest) error {
	user, err := s.GetByID(id)
	if err != nil {
		return err
	}
	
	// Verifica a senha atual
	if !user.CheckPassword(req.SenhaAtual) {
		return errors.New("senha atual incorreta")
	}
	
	// Atualiza a senha (será hasheada no BeforeUpdate)
	if err := s.db.Model(user).Update("senha", req.SenhaNova).Error; err != nil {
		return err
	}
	
	return nil
}

// UpdateLastAccess atualiza o último acesso do usuário
func (s *UserService) UpdateLastAccess(id uint) error {
	now := time.Now()
	return s.db.Model(&models.User{}).Where("id = ?", id).Update("ultimo_acesso", now).Error
}

// GetByStatus retorna usuários por status
func (s *UserService) GetByStatus(status string) ([]models.User, error) {
	var users []models.User
	
	if err := s.db.Where("status = ?", status).Order("data_cadastro DESC").Find(&users).Error; err != nil {
		return nil, err
	}
	
	return users, nil
}

// GetByPerfil retorna usuários por perfil
func (s *UserService) GetByPerfil(perfil string) ([]models.User, error) {
	var users []models.User
	
	if err := s.db.Where("perfil = ?", perfil).Order("data_cadastro DESC").Find(&users).Error; err != nil {
		return nil, err
	}
	
	return users, nil
}

// Search busca usuários por nome ou email
func (s *UserService) Search(query string) ([]models.User, error) {
	var users []models.User
	
	searchPattern := "%" + query + "%"
	
	if err := s.db.Where("nome ILIKE ? OR email ILIKE ?", searchPattern, searchPattern).
		Order("data_cadastro DESC").
		Find(&users).Error; err != nil {
		return nil, err
	}
	
	return users, nil
}

// GetStats retorna estatísticas dos usuários
func (s *UserService) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Total de usuários
	var total int64
	s.db.Model(&models.User{}).Count(&total)
	stats["total"] = total
	
	// Usuários ativos
	var ativos int64
	s.db.Model(&models.User{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos
	
	// Usuários inativos
	var inativos int64
	s.db.Model(&models.User{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos
	
	// Usuários pendentes
	var pendentes int64
	s.db.Model(&models.User{}).Where("status = ?", "Pendente").Count(&pendentes)
	stats["pendentes"] = pendentes
	
	// Usuários por perfil
	var perfilStats []struct {
		Perfil string
		Count  int64
	}
	s.db.Model(&models.User{}).Select("perfil, count(*) as count").Group("perfil").Scan(&perfilStats)
	stats["porPerfil"] = perfilStats
	
	return stats, nil
}

