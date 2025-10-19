package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger logs HTTP requests
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		startTime := time.Now()

		// Process request
		c.Next()

		// Calculate duration
		duration := time.Since(startTime)

		// Get status code
		statusCode := c.Writer.Status()

		// Get client IP
		clientIP := c.ClientIP()

		// Get user agent
		userAgent := c.Request.UserAgent()

		// Get user ID if authenticated
		userID, _ := c.Get("user_id")

		// Log request
		log.Printf(
			"[HTTP] %s %s | Status: %d | Duration: %v | IP: %s | User: %v | UA: %s",
			c.Request.Method,
			c.Request.URL.Path,
			statusCode,
			duration,
			clientIP,
			userID,
			userAgent,
		)

		// Log errors if any
		if len(c.Errors) > 0 {
			for _, err := range c.Errors {
				log.Printf("[ERROR] %s", err.Error())
			}
		}
	}
}

// RequestID adds a unique request ID to each request
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get request ID from header or generate new one
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}

		// Set request ID in context and response header
		c.Set("request_id", requestID)
		c.Writer.Header().Set("X-Request-ID", requestID)

		c.Next()
	}
}

// generateRequestID generates a unique request ID
func generateRequestID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

// randomString generates a random string of specified length
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}

