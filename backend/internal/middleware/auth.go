package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
)

// AuthMiddleware verifica se o usuário está autenticado
func AuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token não fornecido"})
			c.Abort()
			return
		}

		// Remove o prefixo "Bearer "
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "formato de token inválido"})
			c.Abort()
			return
		}

		// Valida o token
		user, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// Adiciona o usuário ao contexto
		c.Set("user", user)
		c.Next()
	}
}

// RequireRole verifica se o usuário tem o perfil necessário
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userInterface, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "não autenticado"})
			c.Abort()
			return
		}

		// Converte para o tipo correto
		user, ok := userInterface.(*models.User)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "usuário inválido"})
			c.Abort()
			return
		}

		// Verifica se o usuário tem um dos perfis permitidos
		hasRole := false
		for _, role := range roles {
			if user.Perfil == role {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "acesso negado"})
			c.Abort()
			return
		}

		c.Next()
	}
}

