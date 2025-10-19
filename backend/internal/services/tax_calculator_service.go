package services

import (
	"errors"
	"fmt"

	"github.com/movix/backend/internal/models"
)

// TaxCalculatorService handles tax calculations
type TaxCalculatorService struct{}

// NewTaxCalculatorService creates a new tax calculator service
func NewTaxCalculatorService() *TaxCalculatorService {
	return &TaxCalculatorService{}
}

// TaxCalculationRequest represents a request to calculate taxes
type TaxCalculationRequest struct {
	TaxRegime         models.TaxRegime
	UF                string
	ProductValue      float64
	Quantity          float64
	NCM               string
	CFOP              string
	IncludeIPI        bool
	IPIRate           float64
	CustomerUF        string
	IsConsumerFinal   bool
}

// TaxCalculationResult represents the result of tax calculation
type TaxCalculationResult struct {
	// ICMS
	ICMSCST      string
	ICMSCSOSN    int
	ICMSOrigin   int
	ICMSBaseCalc float64
	ICMSRate     float64
	ICMSValue    float64

	// IPI
	IPIBaseCalc float64
	IPIRate     float64
	IPIValue    float64

	// PIS
	PISCST      string
	PISBaseCalc float64
	PISRate     float64
	PISValue    float64

	// COFINS
	COFINSCST      string
	COFINSBaseCalc float64
	COFINSRate     float64
	COFINSValue    float64

	// Totals
	TotalProduct float64
	TotalTaxes   float64
}

// CalculateTaxes calculates all taxes for a product
func (s *TaxCalculatorService) CalculateTaxes(req TaxCalculationRequest) (*TaxCalculationResult, error) {
	result := &TaxCalculationResult{
		TotalProduct: req.ProductValue * req.Quantity,
		ICMSOrigin:   0, // 0 = Nacional (padrão)
	}

	// Calculate based on tax regime
	switch req.TaxRegime {
	case models.TaxRegimeSimples, models.TaxRegimeMEI:
		s.calculateSimplesNacional(req, result)
	case models.TaxRegimePresumido:
		s.calculateLucroPresumido(req, result)
	case models.TaxRegimeReal:
		s.calculateLucroReal(req, result)
	default:
		return nil, errors.New("invalid tax regime")
	}

	// Calculate IPI if applicable
	if req.IncludeIPI && req.IPIRate > 0 {
		s.calculateIPI(req, result)
	}

	// Calculate total taxes
	result.TotalTaxes = result.ICMSValue + result.IPIValue + result.PISValue + result.COFINSValue

	return result, nil
}

// calculateSimplesNacional calculates taxes for Simples Nacional regime
func (s *TaxCalculatorService) calculateSimplesNacional(req TaxCalculationRequest, result *TaxCalculationResult) {
	// ICMS - Simples Nacional
	// CSOSN 102 = Tributada pelo Simples Nacional sem permissão de crédito
	// CSOSN 101 = Tributada pelo Simples Nacional com permissão de crédito
	result.ICMSCSOSN = 102
	result.ICMSBaseCalc = 0
	result.ICMSRate = 0
	result.ICMSValue = 0

	// PIS/COFINS - Simples Nacional não destaca PIS/COFINS
	result.PISCST = "99" // Outras operações
	result.PISBaseCalc = 0
	result.PISRate = 0
	result.PISValue = 0

	result.COFINSCST = "99" // Outras operações
	result.COFINSBaseCalc = 0
	result.COFINSRate = 0
	result.COFINSValue = 0
}

// calculateLucroPresumido calculates taxes for Lucro Presumido regime
func (s *TaxCalculatorService) calculateLucroPresumido(req TaxCalculationRequest, result *TaxCalculationResult) {
	// ICMS - Regime Normal
	isInterstate := req.UF != req.CustomerUF
	
	if isInterstate {
		// Interstate operation
		result.ICMSCST = "00" // Tributada integralmente
		result.ICMSBaseCalc = result.TotalProduct
		result.ICMSRate = s.getInterstateICMSRate(req.UF, req.CustomerUF)
		result.ICMSValue = result.ICMSBaseCalc * (result.ICMSRate / 100)
	} else {
		// Intrastate operation
		result.ICMSCST = "00" // Tributada integralmente
		result.ICMSBaseCalc = result.TotalProduct
		result.ICMSRate = s.getInternalICMSRate(req.UF)
		result.ICMSValue = result.ICMSBaseCalc * (result.ICMSRate / 100)
	}

	// PIS/COFINS - Regime Cumulativo (Lucro Presumido)
	result.PISCST = "01" // Operação tributável com alíquota básica
	result.PISBaseCalc = result.TotalProduct
	result.PISRate = 0.65 // 0,65%
	result.PISValue = result.PISBaseCalc * (result.PISRate / 100)

	result.COFINSCST = "01" // Operação tributável com alíquota básica
	result.COFINSBaseCalc = result.TotalProduct
	result.COFINSRate = 3.0 // 3%
	result.COFINSValue = result.COFINSBaseCalc * (result.COFINSRate / 100)
}

// calculateLucroReal calculates taxes for Lucro Real regime
func (s *TaxCalculatorService) calculateLucroReal(req TaxCalculationRequest, result *TaxCalculationResult) {
	// ICMS - Regime Normal
	isInterstate := req.UF != req.CustomerUF
	
	if isInterstate {
		// Interstate operation
		result.ICMSCST = "00" // Tributada integralmente
		result.ICMSBaseCalc = result.TotalProduct
		result.ICMSRate = s.getInterstateICMSRate(req.UF, req.CustomerUF)
		result.ICMSValue = result.ICMSBaseCalc * (result.ICMSRate / 100)
	} else {
		// Intrastate operation
		result.ICMSCST = "00" // Tributada integralmente
		result.ICMSBaseCalc = result.TotalProduct
		result.ICMSRate = s.getInternalICMSRate(req.UF)
		result.ICMSValue = result.ICMSBaseCalc * (result.ICMSRate / 100)
	}

	// PIS/COFINS - Regime Não Cumulativo (Lucro Real)
	result.PISCST = "01" // Operação tributável com alíquota básica
	result.PISBaseCalc = result.TotalProduct
	result.PISRate = 1.65 // 1,65%
	result.PISValue = result.PISBaseCalc * (result.PISRate / 100)

	result.COFINSCST = "01" // Operação tributável com alíquota básica
	result.COFINSBaseCalc = result.TotalProduct
	result.COFINSRate = 7.6 // 7,6%
	result.COFINSValue = result.COFINSBaseCalc * (result.COFINSRate / 100)
}

// calculateIPI calculates IPI tax
func (s *TaxCalculatorService) calculateIPI(req TaxCalculationRequest, result *TaxCalculationResult) {
	result.IPIBaseCalc = result.TotalProduct
	result.IPIRate = req.IPIRate
	result.IPIValue = result.IPIBaseCalc * (result.IPIRate / 100)
}

// getInternalICMSRate returns the internal ICMS rate for a state
func (s *TaxCalculatorService) getInternalICMSRate(uf string) float64 {
	// Alíquotas internas por UF (valores aproximados - verificar legislação atual)
	rates := map[string]float64{
		"AC": 17.0, "AL": 18.0, "AP": 18.0, "AM": 18.0,
		"BA": 18.0, "CE": 18.0, "DF": 18.0, "ES": 17.0,
		"GO": 17.0, "MA": 18.0, "MT": 17.0, "MS": 17.0,
		"MG": 18.0, "PA": 17.0, "PB": 18.0, "PR": 18.0,
		"PE": 18.0, "PI": 18.0, "RJ": 18.0, "RN": 18.0,
		"RS": 18.0, "RO": 17.5, "RR": 17.0, "SC": 17.0,
		"SP": 18.0, "SE": 18.0, "TO": 18.0,
	}

	if rate, ok := rates[uf]; ok {
		return rate
	}
	return 18.0 // Default
}

// getInterstateICMSRate returns the interstate ICMS rate
func (s *TaxCalculatorService) getInterstateICMSRate(originUF, destUF string) float64 {
	// Regiões Norte, Nordeste, Centro-Oeste e Espírito Santo
	northNortheastCenterWest := map[string]bool{
		"AC": true, "AL": true, "AP": true, "AM": true,
		"BA": true, "CE": true, "DF": true, "ES": true,
		"GO": true, "MA": true, "MT": true, "MS": true,
		"PA": true, "PB": true, "PE": true, "PI": true,
		"RN": true, "RO": true, "RR": true, "SE": true,
		"TO": true,
	}

	// Sul e Sudeste (exceto ES)
	southSoutheast := map[string]bool{
		"MG": true, "PR": true, "RJ": true, "RS": true, "SC": true, "SP": true,
	}

	// Origem Sul/Sudeste -> Destino Norte/Nordeste/Centro-Oeste/ES = 7%
	if southSoutheast[originUF] && northNortheastCenterWest[destUF] {
		return 7.0
	}

	// Demais operações interestaduais = 12%
	return 12.0
}

// CalculateTaxesForItem calculates taxes for an NFe item
func (s *TaxCalculatorService) CalculateTaxesForItem(
	item *models.NFeItem,
	company *models.Company,
	customerUF string,
	isConsumerFinal bool,
) error {
	req := TaxCalculationRequest{
		TaxRegime:       company.TaxRegime,
		UF:              company.Address.State,
		ProductValue:    item.CommercialUnitPrice,
		Quantity:        item.CommercialQuantity,
		NCM:             item.NCM,
		CFOP:            item.CFOP,
		IncludeIPI:      false, // Determinar baseado no NCM/CFOP
		IPIRate:         0,
		CustomerUF:      customerUF,
		IsConsumerFinal: isConsumerFinal,
	}

	result, err := s.CalculateTaxes(req)
	if err != nil {
		return fmt.Errorf("failed to calculate taxes: %w", err)
	}

	// Update item with calculated values
	item.ICMSCST = result.ICMSCST
	item.ICMSCSOSN = fmt.Sprintf("%d", result.ICMSCSOSN)
	item.ICMSOrigin = result.ICMSOrigin
	item.ICMSBaseCalc = result.ICMSBaseCalc
	item.ICMSRate = result.ICMSRate
	item.ICMSValue = result.ICMSValue

	item.PISCST = result.PISCST
	item.PISBaseCalc = result.PISBaseCalc
	item.PISRate = result.PISRate
	item.PISValue = result.PISValue

	item.COFINSCST = result.COFINSCST
	item.COFINSBaseCalc = result.COFINSBaseCalc
	item.COFINSRate = result.COFINSRate
	item.COFINSValue = result.COFINSValue

	return nil
}

