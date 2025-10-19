package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/pkg/response"
)

// RequireRole checks if user has one of the required roles
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get role from context (set by AuthMiddleware)
		userRole, exists := c.Get("role")
		if !exists {
			response.Unauthorized(c, "User not authenticated")
			c.Abort()
			return
		}

		// Check if user has one of the required roles
		hasRole := false
		for _, role := range roles {
			if userRole.(string) == role {
				hasRole = true
				break
			}
		}

		if !hasRole {
			response.Forbidden(c, "Insufficient permissions")
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireSuperAdmin checks if user is a superadmin
func RequireSuperAdmin() gin.HandlerFunc {
	return RequireRole("superadmin")
}

// RequireAdmin checks if user is an admin or superadmin
func RequireAdmin() gin.HandlerFunc {
	return RequireRole("admin", "superadmin")
}

// RequireUser checks if user is a regular user, admin, or superadmin
func RequireUser() gin.HandlerFunc {
	return RequireRole("user", "admin", "superadmin")
}

