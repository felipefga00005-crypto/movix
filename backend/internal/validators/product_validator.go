package validators

import (
	"errors"
	"regexp"
	"strconv"
)

// ValidarNCM validates an NCM code (8 digits)
func ValidarNCM(ncm string) error {
	// Remove non-numeric characters
	ncm = regexp.MustCompile(`\D`).ReplaceAllString(ncm, "")
	
	if len(ncm) != 8 {
		return errors.New("NCM deve conter 8 dígitos")
	}
	
	// Check if all characters are digits
	if !regexp.MustCompile(`^\d{8}$`).MatchString(ncm) {
		return errors.New("NCM deve conter apenas dígitos")
	}
	
	return nil
}

// ValidarCEST validates a CEST code (7 digits)
func ValidarCEST(cest string) error {
	if cest == "" {
		return nil // CEST is optional
	}
	
	// Remove non-numeric characters
	cest = regexp.MustCompile(`\D`).ReplaceAllString(cest, "")
	
	if len(cest) != 7 {
		return errors.New("CEST deve conter 7 dígitos")
	}
	
	// Check if all characters are digits
	if !regexp.MustCompile(`^\d{7}$`).MatchString(cest) {
		return errors.New("CEST deve conter apenas dígitos")
	}
	
	return nil
}

// ValidarCFOP validates a CFOP code (4 digits)
func ValidarCFOP(cfop string) error {
	if cfop == "" {
		return nil // CFOP can be optional in product registration
	}
	
	// Remove non-numeric characters
	cfop = regexp.MustCompile(`\D`).ReplaceAllString(cfop, "")
	
	if len(cfop) != 4 {
		return errors.New("CFOP deve conter 4 dígitos")
	}
	
	// Check if all characters are digits
	if !regexp.MustCompile(`^\d{4}$`).MatchString(cfop) {
		return errors.New("CFOP deve conter apenas dígitos")
	}
	
	// First digit must be 1-7
	firstDigit, _ := strconv.Atoi(string(cfop[0]))
	if firstDigit < 1 || firstDigit > 7 {
		return errors.New("CFOP inválido: primeiro dígito deve ser entre 1 e 7")
	}
	
	return nil
}

// ValidarGTIN validates a GTIN/EAN barcode (8, 12, 13, or 14 digits)
func ValidarGTIN(gtin string) error {
	if gtin == "" {
		return nil // GTIN is optional
	}
	
	// Remove non-numeric characters
	gtin = regexp.MustCompile(`\D`).ReplaceAllString(gtin, "")
	
	// GTIN can be 8, 12, 13, or 14 digits
	validLengths := []int{8, 12, 13, 14}
	isValidLength := false
	for _, length := range validLengths {
		if len(gtin) == length {
			isValidLength = true
			break
		}
	}
	
	if !isValidLength {
		return errors.New("GTIN deve conter 8, 12, 13 ou 14 dígitos")
	}
	
	// Validate check digit using GTIN algorithm
	if !validarCheckDigitGTIN(gtin) {
		return errors.New("GTIN inválido: dígito verificador incorreto")
	}
	
	return nil
}

// validarCheckDigitGTIN validates the check digit of a GTIN
func validarCheckDigitGTIN(gtin string) bool {
	if len(gtin) < 8 {
		return false
	}
	
	sum := 0
	for i := 0; i < len(gtin)-1; i++ {
		digit, _ := strconv.Atoi(string(gtin[i]))
		// Multiply odd positions (from right) by 3
		if (len(gtin)-i)%2 == 0 {
			sum += digit * 3
		} else {
			sum += digit
		}
	}
	
	checkDigit := (10 - (sum % 10)) % 10
	lastDigit, _ := strconv.Atoi(string(gtin[len(gtin)-1]))
	
	return checkDigit == lastDigit
}

// ValidarOrigem validates product origin (0-8)
func ValidarOrigem(origem int) error {
	if origem < 0 || origem > 8 {
		return errors.New("origem deve ser entre 0 e 8")
	}
	return nil
}

// ValidarUnidade validates a unit code
func ValidarUnidade(unidade string) error {
	if unidade == "" {
		return errors.New("unidade é obrigatória")
	}
	
	// Common valid units
	validUnits := []string{
		"UN", "PC", "KG", "G", "MG", "L", "ML", "M", "CM", "MM",
		"M2", "M3", "CX", "FD", "PT", "SC", "TON", "DZ", "PAR",
	}
	
	for _, valid := range validUnits {
		if unidade == valid {
			return nil
		}
	}
	
	// If not in the list, just check if it's not too long
	if len(unidade) > 6 {
		return errors.New("unidade deve ter no máximo 6 caracteres")
	}
	
	return nil
}

// FormatarNCM formats an NCM code
func FormatarNCM(ncm string) string {
	ncm = regexp.MustCompile(`\D`).ReplaceAllString(ncm, "")
	if len(ncm) != 8 {
		return ncm
	}
	return ncm[0:4] + "." + ncm[4:6] + "." + ncm[6:8]
}

// FormatarCEST formats a CEST code
func FormatarCEST(cest string) string {
	cest = regexp.MustCompile(`\D`).ReplaceAllString(cest, "")
	if len(cest) != 7 {
		return cest
	}
	return cest[0:2] + "." + cest[2:5] + "." + cest[5:7]
}

// FormatarCFOP formats a CFOP code
func FormatarCFOP(cfop string) string {
	cfop = regexp.MustCompile(`\D`).ReplaceAllString(cfop, "")
	if len(cfop) != 4 {
		return cfop
	}
	return cfop[0:1] + "." + cfop[1:4]
}

