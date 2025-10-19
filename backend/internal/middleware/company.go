package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/pkg/response"
)

// RequireCompany validates if user has access to the company
// This middleware should be used after AuthMiddleware
func RequireCompany(userCompanyRepo *repositories.UserCompanyRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// SuperAdmin and Admin have access to all companies in their account
		role, roleExists := c.Get("role")
		if roleExists && (role.(string) == "superadmin" || role.(string) == "admin") {
			c.Next()
			return
		}

		// Get user ID from context
		userIDStr, exists := c.Get("user_id")
		if !exists {
			response.Unauthorized(c, "User not authenticated")
			c.Abort()
			return
		}

		userID, err := uuid.Parse(userIDStr.(string))
		if err != nil {
			response.BadRequest(c, "Invalid user ID", nil)
			c.Abort()
			return
		}

		// Get company ID from URL parameter
		companyIDStr := c.Param("company_id")
		if companyIDStr == "" {
			// If no company_id in URL, check if user has a company context
			companyIDCtx, exists := c.Get("company_id")
			if !exists {
				response.BadRequest(c, "Company ID is required", nil)
				c.Abort()
				return
			}
			companyIDStr = companyIDCtx.(string)
		}

		companyID, err := uuid.Parse(companyIDStr)
		if err != nil {
			response.BadRequest(c, "Invalid company ID", nil)
			c.Abort()
			return
		}

		// Check if user has access to the company
		hasAccess, err := userCompanyRepo.HasAccess(userID, companyID)
		if err != nil {
			response.InternalServerError(c, "Failed to check company access")
			c.Abort()
			return
		}

		if !hasAccess {
			response.Forbidden(c, "No access to this company")
			c.Abort()
			return
		}

		c.Set("validated_company_id", companyID.String())
		c.Next()
	}
}

// RequireCompanyContext validates if user has a company context in their JWT
func RequireCompanyContext() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get company ID from context (set by AuthMiddleware)
		_, exists := c.Get("company_id")
		if !exists {
			response.BadRequest(c, "Company context is required. Please switch to a company first.", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}

