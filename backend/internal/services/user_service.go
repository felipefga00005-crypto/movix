package services

import (
	"errors"

	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
)

type UserService struct {
	repo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) *UserService {
	return &UserService{
		repo: repo,
	}
}

// GetAll retorna todos os usuários
func (s *UserService) GetAll() ([]models.User, error) {
	return s.repo.GetAll()
}

// GetByID retorna um usuário por ID
func (s *UserService) GetByID(id uint) (*models.User, error) {
	return s.repo.GetByID(id)
}

// GetByEmail retorna um usuário por email
func (s *UserService) GetByEmail(email string) (*models.User, error) {
	return s.repo.GetByEmail(email)
}

// Create cria um novo usuário
func (s *UserService) Create(req *models.CreateUserRequest) (*models.User, error) {
	// Verifica se o email já existe
	if existingUser, _ := s.repo.GetByEmail(req.Email); existingUser != nil {
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
	
	if err := s.repo.Create(user); err != nil {
		return nil, err
	}
	
	return user, nil
}

// Update atualiza um usuário
func (s *UserService) Update(id uint, req *models.UpdateUserRequest) (*models.User, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	
	// Verifica se o email já existe em outro usuário
	if req.Email != "" && req.Email != user.Email {
		if existingUser, _ := s.repo.GetByEmail(req.Email); existingUser != nil && existingUser.ID != id {
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
	
	if err := s.repo.Update(user); err != nil {
		return nil, err
	}
	
	return user, nil
}

// Delete remove um usuário
func (s *UserService) Delete(id uint) error {
	return s.repo.Delete(id)
}

// GetByStatus retorna usuários por status
func (s *UserService) GetByStatus(status string) ([]models.User, error) {
	return s.repo.GetByStatus(status)
}

// GetByPerfil retorna usuários por perfil
func (s *UserService) GetByPerfil(perfil string) ([]models.User, error) {
	return s.repo.GetByPerfil(perfil)
}

// Search busca usuários por nome ou email
func (s *UserService) Search(query string) ([]models.User, error) {
	return s.repo.Search(query)
}

// ChangePassword altera a senha do usuário
func (s *UserService) ChangePassword(id uint, req *models.ChangePasswordRequest) error {
	return s.repo.UpdatePassword(id, req.SenhaNova)
}

// GetStats retorna estatísticas dos usuários
func (s *UserService) GetStats() (map[string]interface{}, error) {
	return s.repo.GetStats()
}
