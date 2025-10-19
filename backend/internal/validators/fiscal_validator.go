package validators

import (
	"errors"
	"regexp"
	"strconv"
	"strings"
)

// FiscalValidator handles fiscal validations
type FiscalValidator struct{}

// NewFiscalValidator creates a new fiscal validator
func NewFiscalValidator() *FiscalValidator {
	return &FiscalValidator{}
}

// ValidateCNPJ validates a CNPJ (Brazilian company tax ID)
func (v *FiscalValidator) ValidateCNPJ(cnpj string) error {
	// Remove non-numeric characters
	cnpj = regexp.MustCompile(`\D`).ReplaceAllString(cnpj, "")

	// Check length
	if len(cnpj) != 14 {
		return errors.New("CNPJ deve ter 14 dígitos")
	}

	// Check for known invalid CNPJs (all same digits)
	if regexp.MustCompile(`^(\d)\1{13}$`).MatchString(cnpj) {
		return errors.New("CNPJ inválido")
	}

	// Calculate first check digit
	sum := 0
	weights := []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	for i := 0; i < 12; i++ {
		digit, _ := strconv.Atoi(string(cnpj[i]))
		sum += digit * weights[i]
	}
	remainder := sum % 11
	firstCheckDigit := 0
	if remainder >= 2 {
		firstCheckDigit = 11 - remainder
	}

	// Verify first check digit
	digit12, _ := strconv.Atoi(string(cnpj[12]))
	if digit12 != firstCheckDigit {
		return errors.New("CNPJ inválido - primeiro dígito verificador incorreto")
	}

	// Calculate second check digit
	sum = 0
	weights = []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	for i := 0; i < 13; i++ {
		digit, _ := strconv.Atoi(string(cnpj[i]))
		sum += digit * weights[i]
	}
	remainder = sum % 11
	secondCheckDigit := 0
	if remainder >= 2 {
		secondCheckDigit = 11 - remainder
	}

	// Verify second check digit
	digit13, _ := strconv.Atoi(string(cnpj[13]))
	if digit13 != secondCheckDigit {
		return errors.New("CNPJ inválido - segundo dígito verificador incorreto")
	}

	return nil
}

// ValidateCPF validates a CPF (Brazilian individual tax ID)
func (v *FiscalValidator) ValidateCPF(cpf string) error {
	// Remove non-numeric characters
	cpf = regexp.MustCompile(`\D`).ReplaceAllString(cpf, "")

	// Check length
	if len(cpf) != 11 {
		return errors.New("CPF deve ter 11 dígitos")
	}

	// Check for known invalid CPFs (all same digits)
	if regexp.MustCompile(`^(\d)\1{10}$`).MatchString(cpf) {
		return errors.New("CPF inválido")
	}

	// Calculate first check digit
	sum := 0
	for i := 0; i < 9; i++ {
		digit, _ := strconv.Atoi(string(cpf[i]))
		sum += digit * (10 - i)
	}
	remainder := sum % 11
	firstCheckDigit := 0
	if remainder >= 2 {
		firstCheckDigit = 11 - remainder
	}

	// Verify first check digit
	digit9, _ := strconv.Atoi(string(cpf[9]))
	if digit9 != firstCheckDigit {
		return errors.New("CPF inválido - primeiro dígito verificador incorreto")
	}

	// Calculate second check digit
	sum = 0
	for i := 0; i < 10; i++ {
		digit, _ := strconv.Atoi(string(cpf[i]))
		sum += digit * (11 - i)
	}
	remainder = sum % 11
	secondCheckDigit := 0
	if remainder >= 2 {
		secondCheckDigit = 11 - remainder
	}

	// Verify second check digit
	digit10, _ := strconv.Atoi(string(cpf[10]))
	if digit10 != secondCheckDigit {
		return errors.New("CPF inválido - segundo dígito verificador incorreto")
	}

	return nil
}

// ValidateIE validates a State Registration (Inscrição Estadual)
// This is a simplified version - each state has its own validation rules
func (v *FiscalValidator) ValidateIE(ie, uf string) error {
	// Remove non-alphanumeric characters
	ie = regexp.MustCompile(`[^a-zA-Z0-9]`).ReplaceAllString(ie, "")
	ie = strings.ToUpper(ie)

	// Check for "ISENTO" (exempt)
	if ie == "ISENTO" {
		return nil
	}

	// Basic validation - check if it's not empty and has reasonable length
	if len(ie) < 8 || len(ie) > 14 {
		return errors.New("IE deve ter entre 8 e 14 caracteres")
	}

	// TODO: Implement specific validation for each state
	// For now, just check if it's not empty
	if ie == "" {
		return errors.New("IE não pode ser vazia")
	}

	return nil
}

// ValidateNCM validates an NCM (Nomenclatura Comum do Mercosul)
func (v *FiscalValidator) ValidateNCM(ncm string) error {
	// Remove non-numeric characters
	ncm = regexp.MustCompile(`\D`).ReplaceAllString(ncm, "")

	// NCM must have exactly 8 digits
	if len(ncm) != 8 {
		return errors.New("NCM deve ter exatamente 8 dígitos")
	}

	// Check if all characters are numeric
	if _, err := strconv.Atoi(ncm); err != nil {
		return errors.New("NCM deve conter apenas números")
	}

	return nil
}

// ValidateCFOP validates a CFOP (Código Fiscal de Operações e Prestações)
func (v *FiscalValidator) ValidateCFOP(cfop string) error {
	// Remove non-numeric characters
	cfop = regexp.MustCompile(`\D`).ReplaceAllString(cfop, "")

	// CFOP must have exactly 4 digits
	if len(cfop) != 4 {
		return errors.New("CFOP deve ter exatamente 4 dígitos")
	}

	// Check if all characters are numeric
	cfopInt, err := strconv.Atoi(cfop)
	if err != nil {
		return errors.New("CFOP deve conter apenas números")
	}

	// First digit must be 1, 2, 3, 5, 6, or 7
	firstDigit := cfopInt / 1000
	validFirstDigits := map[int]bool{1: true, 2: true, 3: true, 5: true, 6: true, 7: true}
	if !validFirstDigits[firstDigit] {
		return errors.New("CFOP inválido - primeiro dígito deve ser 1, 2, 3, 5, 6 ou 7")
	}

	return nil
}

// ValidateCEST validates a CEST (Código Especificador da Substituição Tributária)
func (v *FiscalValidator) ValidateCEST(cest string) error {
	// CEST is optional
	if cest == "" {
		return nil
	}

	// Remove non-numeric characters
	cest = regexp.MustCompile(`\D`).ReplaceAllString(cest, "")

	// CEST must have exactly 7 digits
	if len(cest) != 7 {
		return errors.New("CEST deve ter exatamente 7 dígitos")
	}

	// Check if all characters are numeric
	if _, err := strconv.Atoi(cest); err != nil {
		return errors.New("CEST deve conter apenas números")
	}

	return nil
}

// ValidateEmail validates an email address
func (v *FiscalValidator) ValidateEmail(email string) error {
	if email == "" {
		return nil // Email is optional
	}

	// Simple email regex
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return errors.New("email inválido")
	}

	return nil
}

// ValidateZipCode validates a Brazilian ZIP code (CEP)
func (v *FiscalValidator) ValidateZipCode(zipCode string) error {
	// Remove non-numeric characters
	zipCode = regexp.MustCompile(`\D`).ReplaceAllString(zipCode, "")

	// ZIP code must have exactly 8 digits
	if len(zipCode) != 8 {
		return errors.New("CEP deve ter exatamente 8 dígitos")
	}

	// Check if all characters are numeric
	if _, err := strconv.Atoi(zipCode); err != nil {
		return errors.New("CEP deve conter apenas números")
	}

	return nil
}

// ValidatePhone validates a Brazilian phone number
func (v *FiscalValidator) ValidatePhone(phone string) error {
	if phone == "" {
		return nil // Phone is optional
	}

	// Remove non-numeric characters
	phone = regexp.MustCompile(`\D`).ReplaceAllString(phone, "")

	// Phone must have 10 or 11 digits (with area code)
	if len(phone) != 10 && len(phone) != 11 {
		return errors.New("telefone deve ter 10 ou 11 dígitos (com DDD)")
	}

	// Check if all characters are numeric
	if _, err := strconv.Atoi(phone); err != nil {
		return errors.New("telefone deve conter apenas números")
	}

	return nil
}

// ValidateUF validates a Brazilian state code
func (v *FiscalValidator) ValidateUF(uf string) error {
	validUFs := map[string]bool{
		"AC": true, "AL": true, "AP": true, "AM": true,
		"BA": true, "CE": true, "DF": true, "ES": true,
		"GO": true, "MA": true, "MT": true, "MS": true,
		"MG": true, "PA": true, "PB": true, "PR": true,
		"PE": true, "PI": true, "RJ": true, "RN": true,
		"RS": true, "RO": true, "RR": true, "SC": true,
		"SP": true, "SE": true, "TO": true,
	}

	uf = strings.ToUpper(uf)
	if !validUFs[uf] {
		return errors.New("UF inválida")
	}

	return nil
}

// NormalizeDocument removes formatting from CPF/CNPJ
func (v *FiscalValidator) NormalizeDocument(doc string) string {
	return regexp.MustCompile(`\D`).ReplaceAllString(doc, "")
}

// NormalizeZipCode removes formatting from ZIP code
func (v *FiscalValidator) NormalizeZipCode(zipCode string) string {
	return regexp.MustCompile(`\D`).ReplaceAllString(zipCode, "")
}

// NormalizePhone removes formatting from phone number
func (v *FiscalValidator) NormalizePhone(phone string) string {
	return regexp.MustCompile(`\D`).ReplaceAllString(phone, "")
}

