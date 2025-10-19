package errors

import (
	"errors"
	"fmt"
)

// Common errors
var (
	// Authentication errors
	ErrUnauthorized     = errors.New("unauthorized")
	ErrInvalidToken     = errors.New("invalid token")
	ErrExpiredToken     = errors.New("token has expired")
	ErrInvalidCredentials = errors.New("invalid credentials")
	
	// Authorization errors
	ErrForbidden        = errors.New("forbidden")
	ErrInsufficientPermissions = errors.New("insufficient permissions")
	
	// Resource errors
	ErrNotFound         = errors.New("resource not found")
	ErrAlreadyExists    = errors.New("resource already exists")
	ErrConflict         = errors.New("resource conflict")
	
	// Validation errors
	ErrValidation       = errors.New("validation error")
	ErrInvalidInput     = errors.New("invalid input")
	ErrInvalidEmail     = errors.New("invalid email format")
	ErrInvalidPassword  = errors.New("invalid password")
	ErrPasswordTooShort = errors.New("password too short")
	ErrInvalidCNPJ      = errors.New("invalid CNPJ")
	ErrInvalidCPF       = errors.New("invalid CPF")
	
	// Business logic errors
	ErrLimitExceeded    = errors.New("limit exceeded")
	ErrMaxCompaniesReached = errors.New("maximum number of companies reached")
	ErrMaxUsersReached  = errors.New("maximum number of users reached")
	ErrMaxNFesReached   = errors.New("maximum number of NFes per month reached")
	
	// NFe errors
	ErrNFeNotFound      = errors.New("NFe not found")
	ErrNFeNotDraft      = errors.New("NFe is not in draft status")
	ErrNFeNotAuthorized = errors.New("NFe is not authorized")
	ErrNFeAlreadyAuthorized = errors.New("NFe is already authorized")
	ErrNFeCannotBeCancelled = errors.New("NFe cannot be cancelled")
	ErrNFeCancellationDeadline = errors.New("NFe cancellation deadline exceeded (24 hours)")
	
	// Certificate errors
	ErrCertificateNotFound = errors.New("certificate not found")
	ErrCertificateExpired  = errors.New("certificate has expired")
	ErrCertificateInvalid  = errors.New("invalid certificate")
	ErrNoCertificate       = errors.New("company has no certificate")
	
	// Account/Company errors
	ErrAccountNotFound  = errors.New("account not found")
	ErrAccountSuspended = errors.New("account is suspended")
	ErrAccountCancelled = errors.New("account is cancelled")
	ErrCompanyNotFound  = errors.New("company not found")
	ErrCompanyInactive  = errors.New("company is inactive")
	ErrUserNotFound     = errors.New("user not found")
	ErrUserInactive     = errors.New("user is inactive")
	ErrUserSuspended    = errors.New("user is suspended")
	
	// Access errors
	ErrNoAccessToAccount = errors.New("no access to this account")
	ErrNoAccessToCompany = errors.New("no access to this company")
	ErrNotLinkedToCompany = errors.New("user is not linked to this company")
	
	// Database errors
	ErrDatabaseConnection = errors.New("database connection error")
	ErrDatabaseQuery      = errors.New("database query error")
	ErrDatabaseTransaction = errors.New("database transaction error")
	
	// External service errors
	ErrSEFAZConnection  = errors.New("SEFAZ connection error")
	ErrSEFAZTimeout     = errors.New("SEFAZ timeout")
	ErrSEFAZRejected    = errors.New("SEFAZ rejected the request")
	
	// General errors
	ErrInternal         = errors.New("internal server error")
	ErrBadRequest       = errors.New("bad request")
	ErrInvalidRequest   = errors.New("invalid request")
)

// AppError represents an application error with additional context
type AppError struct {
	Err     error
	Message string
	Code    string
	Details map[string]interface{}
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	return e.Err.Error()
}

// Unwrap returns the underlying error
func (e *AppError) Unwrap() error {
	return e.Err
}

// NewAppError creates a new application error
func NewAppError(err error, message, code string, details map[string]interface{}) *AppError {
	return &AppError{
		Err:     err,
		Message: message,
		Code:    code,
		Details: details,
	}
}

// Wrap wraps an error with additional context
func Wrap(err error, message string) error {
	return fmt.Errorf("%s: %w", message, err)
}

// WrapWithCode wraps an error with a code and message
func WrapWithCode(err error, code, message string) *AppError {
	return &AppError{
		Err:     err,
		Message: message,
		Code:    code,
	}
}

// Is checks if an error matches a target error
func Is(err, target error) bool {
	return errors.Is(err, target)
}

// As finds the first error in err's chain that matches target
func As(err error, target interface{}) bool {
	return errors.As(err, target)
}

// ValidationError represents a validation error with field-specific errors
type ValidationError struct {
	Fields map[string]string
}

// Error implements the error interface
func (e *ValidationError) Error() string {
	return "validation error"
}

// NewValidationError creates a new validation error
func NewValidationError() *ValidationError {
	return &ValidationError{
		Fields: make(map[string]string),
	}
}

// Add adds a field error
func (e *ValidationError) Add(field, message string) {
	e.Fields[field] = message
}

// HasErrors returns true if there are any validation errors
func (e *ValidationError) HasErrors() bool {
	return len(e.Fields) > 0
}

// GetFields returns the field errors
func (e *ValidationError) GetFields() map[string]string {
	return e.Fields
}

