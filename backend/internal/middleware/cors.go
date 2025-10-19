package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/config"
)

// CORS configures Cross-Origin Resource Sharing
func CORS(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Check if origin is allowed
		allowedOrigin := ""
		for _, allowed := range cfg.CORS.AllowedOrigins {
			if allowed == "*" || allowed == origin {
				allowedOrigin = allowed
				break
			}
		}

		if allowedOrigin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", strings.Join(cfg.CORS.AllowedMethods, ", "))
		c.Writer.Header().Set("Access-Control-Allow-Headers", strings.Join(cfg.CORS.AllowedHeaders, ", "))
		c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

