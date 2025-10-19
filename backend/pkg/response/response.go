package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response represents a standard API response
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorData  `json:"error,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

// ErrorData represents error details
type ErrorData struct {
	Code    string                 `json:"code"`
	Message string                 `json:"message"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// Meta represents pagination metadata
type Meta struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// Success sends a successful response
func Success(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// SuccessWithMeta sends a successful response with pagination metadata
func SuccessWithMeta(c *gin.Context, statusCode int, message string, data interface{}, meta *Meta) {
	c.JSON(statusCode, Response{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    meta,
	})
}

// Created sends a 201 Created response
func Created(c *gin.Context, message string, data interface{}) {
	Success(c, http.StatusCreated, message, data)
}

// OK sends a 200 OK response
func OK(c *gin.Context, message string, data interface{}) {
	Success(c, http.StatusOK, message, data)
}

// NoContent sends a 204 No Content response
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// Error sends an error response
func Error(c *gin.Context, statusCode int, code, message string, details map[string]interface{}) {
	c.JSON(statusCode, Response{
		Success: false,
		Error: &ErrorData{
			Code:    code,
			Message: message,
			Details: details,
		},
	})
}

// BadRequest sends a 400 Bad Request response
func BadRequest(c *gin.Context, message string, details map[string]interface{}) {
	Error(c, http.StatusBadRequest, "BAD_REQUEST", message, details)
}

// Unauthorized sends a 401 Unauthorized response
func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, "UNAUTHORIZED", message, nil)
}

// Forbidden sends a 403 Forbidden response
func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, "FORBIDDEN", message, nil)
}

// NotFound sends a 404 Not Found response
func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, "NOT_FOUND", message, nil)
}

// Conflict sends a 409 Conflict response
func Conflict(c *gin.Context, message string) {
	Error(c, http.StatusConflict, "CONFLICT", message, nil)
}

// UnprocessableEntity sends a 422 Unprocessable Entity response
func UnprocessableEntity(c *gin.Context, message string, details map[string]interface{}) {
	Error(c, http.StatusUnprocessableEntity, "UNPROCESSABLE_ENTITY", message, details)
}

// InternalServerError sends a 500 Internal Server Error response
func InternalServerError(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", message, nil)
}

// ValidationError sends a validation error response
func ValidationError(c *gin.Context, errors map[string]interface{}) {
	Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Validation failed", errors)
}

// TooManyRequests sends a 429 Too Many Requests response
func TooManyRequests(c *gin.Context, message string) {
	Error(c, http.StatusTooManyRequests, "TOO_MANY_REQUESTS", message, nil)
}

// ServiceUnavailable sends a 503 Service Unavailable response
func ServiceUnavailable(c *gin.Context, message string) {
	Error(c, http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", message, nil)
}

// CalculateMeta calculates pagination metadata
func CalculateMeta(page, perPage int, total int64) *Meta {
	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}

	return &Meta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
	}
}

