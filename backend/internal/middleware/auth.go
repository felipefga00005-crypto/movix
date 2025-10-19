package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/pkg/jwt"
	"github.com/movix/backend/pkg/response"
)

// AuthMiddleware validates JWT token and extracts claims
func AuthMiddleware(jwtManager *jwt.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Authorization header is required")
			c.Abort()
			return
		}

		// Check if it's a Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Unauthorized(c, "Invalid authorization header format")
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Validate token
		claims, err := jwtManager.ValidateToken(tokenString)
		if err != nil {
			switch err {
			case jwt.ErrExpiredToken:
				response.Unauthorized(c, "Token has expired")
			case jwt.ErrInvalidToken:
				response.Unauthorized(c, "Invalid token")
			case jwt.ErrInvalidSignature:
				response.Unauthorized(c, "Invalid token signature")
			default:
				response.Unauthorized(c, "Token validation failed")
			}
			c.Abort()
			return
		}

		// Set claims in context
		c.Set("user_id", claims.UserID.String())
		c.Set("email", claims.Email)
		c.Set("name", claims.Name)
		c.Set("role", claims.Role)
		
		if claims.AccountID != nil {
			c.Set("account_id", claims.AccountID.String())
		}
		
		if claims.CompanyID != nil {
			c.Set("company_id", claims.CompanyID.String())
		}

		c.Next()
	}
}

// OptionalAuthMiddleware validates JWT token if present but doesn't require it
func OptionalAuthMiddleware(jwtManager *jwt.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		// Check if it's a Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}

		tokenString := parts[1]

		// Validate token
		claims, err := jwtManager.ValidateToken(tokenString)
		if err != nil {
			c.Next()
			return
		}

		// Set claims in context
		c.Set("user_id", claims.UserID.String())
		c.Set("email", claims.Email)
		c.Set("name", claims.Name)
		c.Set("role", claims.Role)
		
		if claims.AccountID != nil {
			c.Set("account_id", claims.AccountID.String())
		}
		
		if claims.CompanyID != nil {
			c.Set("company_id", claims.CompanyID.String())
		}

		c.Next()
	}
}

