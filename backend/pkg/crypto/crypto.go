package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidPassword = errors.New("invalid password")
	ErrEncryptionFailed = errors.New("encryption failed")
	ErrDecryptionFailed = errors.New("decryption failed")
)

const (
	// DefaultCost is the default bcrypt cost
	DefaultCost = bcrypt.DefaultCost
	// MinPasswordLength is the minimum password length
	MinPasswordLength = 8
)

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	if len(password) < MinPasswordLength {
		return "", ErrInvalidPassword
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashedBytes), nil
}

// ComparePassword compares a hashed password with a plain text password
func ComparePassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// VerifyPassword verifies if a password matches the hash
func VerifyPassword(hashedPassword, password string) bool {
	err := ComparePassword(hashedPassword, password)
	return err == nil
}

// Encrypt encrypts data using AES-GCM
func Encrypt(plaintext []byte, key []byte) (string, error) {
	// Ensure key is 32 bytes for AES-256
	if len(key) != 32 {
		return "", errors.New("key must be 32 bytes for AES-256")
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", ErrEncryptionFailed
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", ErrEncryptionFailed
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", ErrEncryptionFailed
	}

	ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt decrypts data using AES-GCM
func Decrypt(ciphertext string, key []byte) ([]byte, error) {
	// Ensure key is 32 bytes for AES-256
	if len(key) != 32 {
		return nil, errors.New("key must be 32 bytes for AES-256")
	}

	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return nil, ErrDecryptionFailed
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, ErrDecryptionFailed
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, ErrDecryptionFailed
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, ErrDecryptionFailed
	}

	nonce, ciphertextBytes := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertextBytes, nil)
	if err != nil {
		return nil, ErrDecryptionFailed
	}

	return plaintext, nil
}

// EncryptString encrypts a string using AES-GCM
func EncryptString(plaintext string, key []byte) (string, error) {
	return Encrypt([]byte(plaintext), key)
}

// DecryptString decrypts a string using AES-GCM
func DecryptString(ciphertext string, key []byte) (string, error) {
	plaintext, err := Decrypt(ciphertext, key)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}

// GenerateRandomBytes generates random bytes of specified length
func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return nil, err
	}
	return b, nil
}

// GenerateRandomString generates a random base64 encoded string
func GenerateRandomString(n int) (string, error) {
	b, err := GenerateRandomBytes(n)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

