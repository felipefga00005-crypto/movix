package validators

import (
	"errors"
	"regexp"
	"strconv"
	"strings"
)

// ValidarCPF validates a CPF (Brazilian individual taxpayer ID)
func ValidarCPF(cpf string) error {
	// Remove non-numeric characters
	cpf = regexp.MustCompile(`\D`).ReplaceAllString(cpf, "")
	
	if len(cpf) != 11 {
		return errors.New("CPF deve conter 11 dígitos")
	}
	
	// Check for known invalid CPFs
	invalidCPFs := []string{
		"00000000000", "11111111111", "22222222222", "33333333333",
		"44444444444", "55555555555", "66666666666", "77777777777",
		"88888888888", "99999999999",
	}
	
	for _, invalid := range invalidCPFs {
		if cpf == invalid {
			return errors.New("CPF inválido")
		}
	}
	
	// Validate first check digit
	sum := 0
	for i := 0; i < 9; i++ {
		digit, _ := strconv.Atoi(string(cpf[i]))
		sum += digit * (10 - i)
	}
	remainder := sum % 11
	checkDigit1 := 0
	if remainder >= 2 {
		checkDigit1 = 11 - remainder
	}
	
	if strconv.Itoa(checkDigit1) != string(cpf[9]) {
		return errors.New("CPF inválido")
	}
	
	// Validate second check digit
	sum = 0
	for i := 0; i < 10; i++ {
		digit, _ := strconv.Atoi(string(cpf[i]))
		sum += digit * (11 - i)
	}
	remainder = sum % 11
	checkDigit2 := 0
	if remainder >= 2 {
		checkDigit2 = 11 - remainder
	}
	
	if strconv.Itoa(checkDigit2) != string(cpf[10]) {
		return errors.New("CPF inválido")
	}
	
	return nil
}

// ValidarCNPJ validates a CNPJ (Brazilian company taxpayer ID)
func ValidarCNPJ(cnpj string) error {
	// Remove non-numeric characters
	cnpj = regexp.MustCompile(`\D`).ReplaceAllString(cnpj, "")
	
	if len(cnpj) != 14 {
		return errors.New("CNPJ deve conter 14 dígitos")
	}
	
	// Check for known invalid CNPJs
	invalidCNPJs := []string{
		"00000000000000", "11111111111111", "22222222222222", "33333333333333",
		"44444444444444", "55555555555555", "66666666666666", "77777777777777",
		"88888888888888", "99999999999999",
	}
	
	for _, invalid := range invalidCNPJs {
		if cnpj == invalid {
			return errors.New("CNPJ inválido")
		}
	}
	
	// Validate first check digit
	weights1 := []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	sum := 0
	for i := 0; i < 12; i++ {
		digit, _ := strconv.Atoi(string(cnpj[i]))
		sum += digit * weights1[i]
	}
	remainder := sum % 11
	checkDigit1 := 0
	if remainder >= 2 {
		checkDigit1 = 11 - remainder
	}
	
	if strconv.Itoa(checkDigit1) != string(cnpj[12]) {
		return errors.New("CNPJ inválido")
	}
	
	// Validate second check digit
	weights2 := []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	sum = 0
	for i := 0; i < 13; i++ {
		digit, _ := strconv.Atoi(string(cnpj[i]))
		sum += digit * weights2[i]
	}
	remainder = sum % 11
	checkDigit2 := 0
	if remainder >= 2 {
		checkDigit2 = 11 - remainder
	}
	
	if strconv.Itoa(checkDigit2) != string(cnpj[13]) {
		return errors.New("CNPJ inválido")
	}
	
	return nil
}

// ValidarCEP validates a CEP (Brazilian postal code)
func ValidarCEP(cep string) error {
	// Remove non-numeric characters
	cep = regexp.MustCompile(`\D`).ReplaceAllString(cep, "")
	
	if len(cep) != 8 {
		return errors.New("CEP deve conter 8 dígitos")
	}
	
	// Check if all digits are the same
	if regexp.MustCompile(`^(\d)\1{7}$`).MatchString(cep) {
		return errors.New("CEP inválido")
	}
	
	return nil
}

// ValidarCodigoIBGE validates an IBGE city code
func ValidarCodigoIBGE(codigo string) error {
	// Remove non-numeric characters
	codigo = regexp.MustCompile(`\D`).ReplaceAllString(codigo, "")
	
	if len(codigo) != 7 {
		return errors.New("Código IBGE deve conter 7 dígitos")
	}
	
	return nil
}

// ValidarUF validates a Brazilian state code (UF)
func ValidarUF(uf string) error {
	uf = strings.ToUpper(strings.TrimSpace(uf))
	
	validUFs := []string{
		"AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
		"MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
		"RS", "RO", "RR", "SC", "SP", "SE", "TO",
	}
	
	for _, validUF := range validUFs {
		if uf == validUF {
			return nil
		}
	}
	
	return errors.New("UF inválida")
}

// ValidarEmail validates an email address
func ValidarEmail(email string) error {
	if email == "" {
		return nil // Email is optional
	}
	
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return errors.New("Email inválido")
	}
	
	return nil
}

// ValidarTelefone validates a Brazilian phone number
func ValidarTelefone(telefone string) error {
	if telefone == "" {
		return nil // Phone is optional
	}
	
	// Remove non-numeric characters
	telefone = regexp.MustCompile(`\D`).ReplaceAllString(telefone, "")
	
	// Brazilian phone numbers have 10 or 11 digits (with area code)
	if len(telefone) < 10 || len(telefone) > 11 {
		return errors.New("Telefone deve conter 10 ou 11 dígitos (com DDD)")
	}
	
	return nil
}

// FormatarCPF formats a CPF string
func FormatarCPF(cpf string) string {
	cpf = regexp.MustCompile(`\D`).ReplaceAllString(cpf, "")
	if len(cpf) != 11 {
		return cpf
	}
	return cpf[0:3] + "." + cpf[3:6] + "." + cpf[6:9] + "-" + cpf[9:11]
}

// FormatarCNPJ formats a CNPJ string
func FormatarCNPJ(cnpj string) string {
	cnpj = regexp.MustCompile(`\D`).ReplaceAllString(cnpj, "")
	if len(cnpj) != 14 {
		return cnpj
	}
	return cnpj[0:2] + "." + cnpj[2:5] + "." + cnpj[5:8] + "/" + cnpj[8:12] + "-" + cnpj[12:14]
}

// FormatarCEP formats a CEP string
func FormatarCEP(cep string) string {
	cep = regexp.MustCompile(`\D`).ReplaceAllString(cep, "")
	if len(cep) != 8 {
		return cep
	}
	return cep[0:5] + "-" + cep[5:8]
}

// RemoverFormatacao removes formatting from a string (keeps only numbers)
func RemoverFormatacao(s string) string {
	return regexp.MustCompile(`\D`).ReplaceAllString(s, "")
}

