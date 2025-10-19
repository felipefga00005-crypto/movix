package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/movix/backend/pkg/response"
)

// RequireAccount validates if user has access to the account
// This middleware should be used after AuthMiddleware
func RequireAccount() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user's account ID from context
		userAccountID, exists := c.Get("account_id")
		if !exists {
			// SuperAdmin has no account_id, so they have access to all accounts
			role, roleExists := c.Get("role")
			if roleExists && role.(string) == "superadmin" {
				c.Next()
				return
			}
			
			response.Forbidden(c, "No account access")
			c.Abort()
			return
		}

		// Get resource account ID from URL parameter
		resourceAccountID := c.Param("account_id")
		if resourceAccountID == "" {
			// If no account_id in URL, allow access (will be validated by business logic)
			c.Next()
			return
		}

		// Check if user's account matches resource account
		if userAccountID.(string) != resourceAccountID {
			// SuperAdmin can access any account
			role, roleExists := c.Get("role")
			if roleExists && role.(string) == "superadmin" {
				c.Next()
				return
			}
			
			response.Forbidden(c, "No access to this account")
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireSameAccount validates if the account_id in the request matches user's account
func RequireSameAccount() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user's account ID from context
		userAccountID, exists := c.Get("account_id")
		if !exists {
			// SuperAdmin has no account_id, so they have access to all accounts
			role, roleExists := c.Get("role")
			if roleExists && role.(string) == "superadmin" {
				c.Next()
				return
			}
			
			response.Forbidden(c, "No account access")
			c.Abort()
			return
		}

		c.Set("validated_account_id", userAccountID.(string))
		c.Next()
	}
}

