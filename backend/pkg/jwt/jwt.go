package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var (
	ErrInvalidToken     = errors.New("invalid token")
	ErrExpiredToken     = errors.New("token has expired")
	ErrInvalidSignature = errors.New("invalid token signature")
)

// Claims represents the JWT claims
type Claims struct {
	UserID    uuid.UUID  `json:"user_id"`
	AccountID *uuid.UUID `json:"account_id,omitempty"` // NULL for superadmin
	CompanyID *uuid.UUID `json:"company_id,omitempty"` // Current company context
	Email     string     `json:"email"`
	Name      string     `json:"name"`
	Role      string     `json:"role"`
	jwt.RegisteredClaims
}

// TokenPair represents access and refresh tokens
type TokenPair struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

// JWTManager handles JWT operations
type JWTManager struct {
	secretKey             string
	accessTokenDuration   time.Duration
	refreshTokenDuration  time.Duration
}

// NewJWTManager creates a new JWT manager
func NewJWTManager(secretKey string, accessDuration, refreshDuration time.Duration) *JWTManager {
	return &JWTManager{
		secretKey:            secretKey,
		accessTokenDuration:  accessDuration,
		refreshTokenDuration: refreshDuration,
	}
}

// GenerateToken generates a new access token
func (m *JWTManager) GenerateToken(userID uuid.UUID, accountID *uuid.UUID, companyID *uuid.UUID, email, name, role string) (string, error) {
	now := time.Now()
	expiresAt := now.Add(m.accessTokenDuration)

	claims := &Claims{
		UserID:    userID,
		AccountID: accountID,
		CompanyID: companyID,
		Email:     email,
		Name:      name,
		Role:      role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "movix-api",
			Subject:   userID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(m.secretKey))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// GenerateRefreshToken generates a new refresh token
func (m *JWTManager) GenerateRefreshToken(userID uuid.UUID, email string) (string, error) {
	now := time.Now()
	expiresAt := now.Add(m.refreshTokenDuration)

	claims := &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(expiresAt),
		IssuedAt:  jwt.NewNumericDate(now),
		NotBefore: jwt.NewNumericDate(now),
		Issuer:    "movix-api",
		Subject:   userID.String(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(m.secretKey))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// GenerateTokenPair generates both access and refresh tokens
func (m *JWTManager) GenerateTokenPair(userID uuid.UUID, accountID *uuid.UUID, companyID *uuid.UUID, email, name, role string) (*TokenPair, error) {
	accessToken, err := m.GenerateToken(userID, accountID, companyID, email, name, role)
	if err != nil {
		return nil, err
	}

	refreshToken, err := m.GenerateRefreshToken(userID, email)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(m.accessTokenDuration),
	}, nil
}

// ValidateToken validates and parses a JWT token
func (m *JWTManager) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidSignature
		}
		return []byte(m.secretKey), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// ValidateRefreshToken validates a refresh token
func (m *JWTManager) ValidateRefreshToken(tokenString string) (*jwt.RegisteredClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidSignature
		}
		return []byte(m.secretKey), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// RefreshAccessToken generates a new access token from a refresh token
func (m *JWTManager) RefreshAccessToken(refreshToken string, userID uuid.UUID, accountID *uuid.UUID, companyID *uuid.UUID, email, name, role string) (string, error) {
	// Validate refresh token
	_, err := m.ValidateRefreshToken(refreshToken)
	if err != nil {
		return "", err
	}

	// Generate new access token
	return m.GenerateToken(userID, accountID, companyID, email, name, role)
}

// ExtractUserID extracts user ID from token without full validation
func (m *JWTManager) ExtractUserID(tokenString string) (uuid.UUID, error) {
	token, _, err := jwt.NewParser().ParseUnverified(tokenString, &Claims{})
	if err != nil {
		return uuid.Nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return uuid.Nil, ErrInvalidToken
	}

	return claims.UserID, nil
}

