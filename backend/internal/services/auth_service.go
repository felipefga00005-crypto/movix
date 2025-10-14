package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type AuthService struct {
	db        *gorm.DB
	jwtSecret string
}

func NewAuthService(db *gorm.DB, jwtSecret string) *AuthService {
	return &AuthService{
		db:        db,
		jwtSecret: jwtSecret,
	}
}

// Login autentica um usuário e retorna um token JWT
func (s *AuthService) Login(req *models.LoginRequest) (*models.LoginResponse, error) {
	var user models.User
	
	// Busca usuário por email
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("credenciais inválidas")
		}
		return nil, err
	}

	// Verifica se o usuário está ativo
	if user.Status != "Ativo" {
		return nil, errors.New("usuário inativo")
	}

	// Verifica a senha
	if !user.CheckPassword(req.Senha) {
		return nil, errors.New("credenciais inválidas")
	}

	// Atualiza último acesso
	now := time.Now()
	user.UltimoAcesso = &now
	s.db.Model(&user).Update("ultimo_acesso", now)

	// Gera token JWT
	token, err := s.generateToken(&user)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Token: token,
		User:  user,
	}, nil
}

// Register cria um novo usuário (apenas para setup inicial)
func (s *AuthService) Register(req *models.CreateUserRequest) (*models.User, error) {
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

// CheckSetupRequired verifica se o sistema precisa de setup inicial
func (s *AuthService) CheckSetupRequired() (bool, error) {
	var count int64
	if err := s.db.Model(&models.User{}).Count(&count).Error; err != nil {
		return false, err
	}
	return count == 0, nil
}

// SetupSuperAdmin cria o primeiro usuário super admin
func (s *AuthService) SetupSuperAdmin(req *models.SetupRequest) (*models.LoginResponse, error) {
	// Verifica se já existe algum usuário
	setupRequired, err := s.CheckSetupRequired()
	if err != nil {
		return nil, err
	}
	
	if !setupRequired {
		return nil, errors.New("setup já foi realizado")
	}

	// Cria o super admin
	user := &models.User{
		Nome:         req.Nome,
		Email:        req.Email,
		Senha:        req.Senha, // Será hasheada no BeforeCreate
		Telefone:     req.Telefone,
		Cargo:        "Administrador",
		Departamento: "TI",
		Perfil:       "super_admin",
		Status:       "Ativo",
	}

	if err := s.db.Create(user).Error; err != nil {
		return nil, err
	}

	// Gera token JWT
	token, err := s.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}

// ValidateToken valida um token JWT e retorna o usuário
func (s *AuthService) ValidateToken(tokenString string) (*models.User, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("método de assinatura inválido")
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := uint(claims["user_id"].(float64))
		
		var user models.User
		if err := s.db.First(&user, userID).Error; err != nil {
			return nil, errors.New("usuário não encontrado")
		}

		if user.Status != "Ativo" {
			return nil, errors.New("usuário inativo")
		}

		return &user, nil
	}

	return nil, errors.New("token inválido")
}

// generateToken gera um token JWT para o usuário
func (s *AuthService) generateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"perfil":  user.Perfil,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 dias
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

// RefreshToken gera um novo token para o usuário
func (s *AuthService) RefreshToken(userID uint) (string, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return "", errors.New("usuário não encontrado")
	}

	if user.Status != "Ativo" {
		return "", errors.New("usuário inativo")
	}

	return s.generateToken(&user)
}

