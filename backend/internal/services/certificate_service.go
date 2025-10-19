package services

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"time"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	appErrors "github.com/movix/backend/pkg/errors"
	"golang.org/x/crypto/pkcs12"
)

// CertificateService handles certificate business logic
type CertificateService struct {
	certRepo    *repositories.CertificateRepository
	companyRepo *repositories.CompanyRepository
	encryptKey  []byte // AES-256 key (32 bytes)
}

// NewCertificateService creates a new certificate service
func NewCertificateService(
	certRepo *repositories.CertificateRepository,
	companyRepo *repositories.CompanyRepository,
	encryptKey string,
) *CertificateService {
	// Ensure key is 32 bytes for AES-256
	key := []byte(encryptKey)
	if len(key) < 32 {
		// Pad with zeros if too short
		padded := make([]byte, 32)
		copy(padded, key)
		key = padded
	} else if len(key) > 32 {
		// Truncate if too long
		key = key[:32]
	}

	return &CertificateService{
		certRepo:    certRepo,
		companyRepo: companyRepo,
		encryptKey:  key,
	}
}

// UploadCertificateRequest represents a certificate upload request
type UploadCertificateRequest struct {
	CompanyID uuid.UUID `json:"company_id" binding:"required"`
	Name      string    `json:"name" binding:"required"`
	Content   []byte    `json:"content" binding:"required"` // .pfx file content
	Password  string    `json:"password" binding:"required"`
}

// CertificateResponse represents a certificate in responses
type CertificateResponse struct {
	ID        uuid.UUID                `json:"id"`
	CompanyID uuid.UUID                `json:"company_id"`
	Name      string                   `json:"name"`
	ExpiresAt string                   `json:"expires_at"`
	Status    models.CertificateStatus `json:"status"`
	CreatedAt string                   `json:"created_at"`
	UpdatedAt string                   `json:"updated_at"`
}

// UploadCertificate uploads and validates a new certificate
func (s *CertificateService) UploadCertificate(req UploadCertificateRequest) (*CertificateResponse, error) {
	// Validate company exists
	company, err := s.companyRepo.FindByID(req.CompanyID)
	if err != nil {
		return nil, appErrors.ErrCompanyNotFound
	}

	// Validate certificate and extract expiration date
	expiresAt, err := s.ValidateCertificate(req.Content, req.Password)
	if err != nil {
		return nil, err
	}

	// Check if certificate is already expired
	if time.Now().After(expiresAt) {
		return nil, errors.New("certificate is already expired")
	}

	// Deactivate any existing active certificates for this company
	existingCerts, err := s.certRepo.FindByCompany(req.CompanyID)
	if err == nil && len(existingCerts) > 0 {
		for _, cert := range existingCerts {
			if cert.IsActive() {
				cert.Status = models.CertificateStatusInactive
				s.certRepo.Update(&cert)
			}
		}
	}

	// Encrypt certificate content
	encryptedContent, err := s.EncryptData(req.Content)
	if err != nil {
		return nil, errors.New("failed to encrypt certificate content")
	}

	// Encrypt password
	encryptedPassword, err := s.EncryptData([]byte(req.Password))
	if err != nil {
		return nil, errors.New("failed to encrypt certificate password")
	}

	// Create certificate
	cert := &models.Certificate{
		CompanyID: req.CompanyID,
		Name:      req.Name,
		Content:   encryptedContent,
		Password:  base64.StdEncoding.EncodeToString(encryptedPassword),
		ExpiresAt: expiresAt,
		Status:    models.CertificateStatusActive,
	}

	if err := s.certRepo.Create(cert); err != nil {
		return nil, errors.New("failed to save certificate")
	}

	// Update company certificate_id
	company.CertificateID = &cert.ID
	s.companyRepo.Update(company)

	return s.toCertificateResponse(cert), nil
}

// ValidateCertificate validates a .pfx certificate and returns expiration date
func (s *CertificateService) ValidateCertificate(content []byte, password string) (time.Time, error) {
	// Try to decode the PKCS12 certificate
	_, cert, err := pkcs12.Decode(content, password)
	if err != nil {
		return time.Time{}, errors.New("invalid certificate or password")
	}

	if cert == nil {
		return time.Time{}, errors.New("no certificate found in .pfx file")
	}

	// Check if certificate is valid
	if time.Now().Before(cert.NotBefore) {
		return time.Time{}, errors.New("certificate is not yet valid")
	}

	if time.Now().After(cert.NotAfter) {
		return time.Time{}, errors.New("certificate has expired")
	}

	return cert.NotAfter, nil
}

// EncryptData encrypts data using AES-256-GCM
func (s *CertificateService) EncryptData(plaintext []byte) ([]byte, error) {
	block, err := aes.NewCipher(s.encryptKey)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)
	return ciphertext, nil
}

// DecryptData decrypts data using AES-256-GCM
func (s *CertificateService) DecryptData(ciphertext []byte) ([]byte, error) {
	block, err := aes.NewCipher(s.encryptKey)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return nil, errors.New("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

// GetActiveCertificate returns the active certificate for a company
func (s *CertificateService) GetActiveCertificate(companyID uuid.UUID) (*CertificateResponse, error) {
	cert, err := s.certRepo.FindActiveByCompany(companyID)
	if err != nil {
		return nil, appErrors.ErrCertificateNotFound
	}

	// Update status if expired
	cert.UpdateStatus(s.certRepo.GetDB())

	if !cert.IsValid() {
		return nil, errors.New("certificate is not valid or has expired")
	}

	return s.toCertificateResponse(cert), nil
}

// GetCertificateByID returns a certificate by ID
func (s *CertificateService) GetCertificateByID(id uuid.UUID) (*CertificateResponse, error) {
	cert, err := s.certRepo.FindByID(id)
	if err != nil {
		return nil, appErrors.ErrCertificateNotFound
	}

	return s.toCertificateResponse(cert), nil
}

// GetCompanyCertificates returns all certificates for a company
func (s *CertificateService) GetCompanyCertificates(companyID uuid.UUID) ([]*CertificateResponse, error) {
	certs, err := s.certRepo.FindByCompany(companyID)
	if err != nil {
		return nil, err
	}

	responses := make([]*CertificateResponse, len(certs))
	for i, cert := range certs {
		responses[i] = s.toCertificateResponse(&cert)
	}

	return responses, nil
}

// DeleteCertificate deletes a certificate
func (s *CertificateService) DeleteCertificate(id uuid.UUID) error {
	cert, err := s.certRepo.FindByID(id)
	if err != nil {
		return appErrors.ErrCertificateNotFound
	}

	// Update company certificate_id if this is the active certificate
	company, err := s.companyRepo.FindByID(cert.CompanyID)
	if err == nil && company.CertificateID != nil && *company.CertificateID == id {
		company.CertificateID = nil
		s.companyRepo.Update(company)
	}

	return s.certRepo.Delete(id)
}

// GetDecryptedCertificate returns the decrypted certificate content and password
func (s *CertificateService) GetDecryptedCertificate(id uuid.UUID) ([]byte, string, error) {
	cert, err := s.certRepo.FindByID(id)
	if err != nil {
		return nil, "", appErrors.ErrCertificateNotFound
	}

	if !cert.IsValid() {
		return nil, "", errors.New("certificate is not valid or has expired")
	}

	// Decrypt content
	content, err := s.DecryptData(cert.Content)
	if err != nil {
		return nil, "", errors.New("failed to decrypt certificate content")
	}

	// Decrypt password
	encryptedPassword, err := base64.StdEncoding.DecodeString(cert.Password)
	if err != nil {
		return nil, "", errors.New("failed to decode certificate password")
	}

	passwordBytes, err := s.DecryptData(encryptedPassword)
	if err != nil {
		return nil, "", errors.New("failed to decrypt certificate password")
	}

	return content, string(passwordBytes), nil
}

// CheckExpiringCertificates returns certificates expiring within the specified days
func (s *CertificateService) CheckExpiringCertificates(days int) ([]*CertificateResponse, error) {
	// This would typically be called by a cron job
	// For now, we'll return an empty list
	// In a real implementation, you'd query all active certificates and check expiration
	return []*CertificateResponse{}, nil
}

// toCertificateResponse converts a Certificate model to CertificateResponse
func (s *CertificateService) toCertificateResponse(cert *models.Certificate) *CertificateResponse {
	return &CertificateResponse{
		ID:        cert.ID,
		CompanyID: cert.CompanyID,
		Name:      cert.Name,
		ExpiresAt: cert.ExpiresAt.Format(time.RFC3339),
		Status:    cert.Status,
		CreatedAt: cert.CreatedAt.Format(time.RFC3339),
		UpdatedAt: cert.UpdatedAt.Format(time.RFC3339),
	}
}

