package services

import (
	"errors"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{
		db: db,
	}
}

// GetAll retorna todos os usuários
func (s *UserService) GetAll() ([]models.User, error) {
	var users []models.User
	if err := s.db.Find(&users).Error; err != nil {
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
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// Create cria um novo usuário
func (s *UserService) Create(req *models.CreateUserRequest) (*models.User, error) {
	// Verifica se o email já existe
	if existingUser, _ := s.GetByEmail(req.Email); existingUser != nil {
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
		if existingUser, _ := s.GetByEmail(req.Email); existingUser != nil && existingUser.ID != id {
			return nil, errors.New("email já cadastrado")
		}
	}
	
	// Atualiza apenas os campos fornecidos
	if req.Nome != "" {
		user.Nome = req.Nome
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Telefone != "" {
		user.Telefone = req.Telefone
	}
	if req.Cargo != "" {
		user.Cargo = req.Cargo
	}
	if req.Departamento != "" {
		user.Departamento = req.Departamento
	}
	if req.Perfil != "" {
		user.Perfil = req.Perfil
	}
	if req.Status != "" {
		user.Status = req.Status
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	// Senha não é atualizada via Update, use ChangePassword

	if err := s.db.Save(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

// Delete remove um usuário (soft delete)
func (s *UserService) Delete(id uint) error {
	return s.db.Delete(&models.User{}, id).Error
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

// ChangePassword altera a senha do usuário
func (s *UserService) ChangePassword(id uint, req *models.ChangePasswordRequest) error {
	user, err := s.GetByID(id)
	if err != nil {
		return err
	}

	// Hash da nova senha
	user.Senha = req.SenhaNova
	// O hash será feito no BeforeUpdate se implementado, ou fazemos aqui

	return s.db.Model(user).Update("senha", req.SenhaNova).Error
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

	// Por perfil
	type PerfilStat struct {
		Perfil string
		Count  int64
	}
	var perfilStats []PerfilStat
	s.db.Model(&models.User{}).Select("perfil, count(*) as count").Group("perfil").Scan(&perfilStats)

	perfilMap := make(map[string]int64)
	for _, stat := range perfilStats {
		perfilMap[stat.Perfil] = stat.Count
	}
	stats["porPerfil"] = perfilMap

	return stats, nil
}
