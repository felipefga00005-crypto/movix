package models

import (
	"math"
	"testing"
)

// abs retorna o valor absoluto de um float64
func abs(x float64) float64 {
	return math.Abs(x)
}

// ============================================
// TESTES PARA MODELO EMPRESA
// ============================================

func TestEmpresa_GetCodigoUF(t *testing.T) {
	tests := []struct {
		name     string
		uf       string
		expected string
	}{
		{"São Paulo", "SP", "35"},
		{"Rio de Janeiro", "RJ", "33"},
		{"Minas Gerais", "MG", "31"},
		{"Bahia", "BA", "29"},
		{"UF Inválida", "XX", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			empresa := &Empresa{UF: tt.uf}
			result := empresa.GetCodigoUF()
			if result != tt.expected {
				t.Errorf("GetCodigoUF() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestEmpresa_IsProducao(t *testing.T) {
	tests := []struct {
		name        string
		ambienteNFe int
		expected    bool
	}{
		{"Produção", 1, true},
		{"Homologação", 2, false},
		{"Valor inválido", 0, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			empresa := &Empresa{AmbienteNFe: tt.ambienteNFe}
			result := empresa.IsProducao()
			if result != tt.expected {
				t.Errorf("IsProducao() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

// ============================================
// TESTES PARA MODELO NATUREZA OPERAÇÃO
// ============================================

func TestNaturezaOperacao_GetCFOP(t *testing.T) {
	natureza := &NaturezaOperacao{
		CFOPDentroEstado: "5102",
		CFOPForaEstado:   "6102",
		CFOPExterior:     "7102",
	}

	tests := []struct {
		name      string
		ufOrigem  string
		ufDestino string
		expected  string
	}{
		{"Mesmo estado", "SP", "SP", "5102"},
		{"Estados diferentes", "SP", "RJ", "6102"},
		{"Destino vazio", "SP", "", "5102"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := natureza.GetCFOP(tt.ufOrigem, tt.ufDestino)
			if result != tt.expected {
				t.Errorf("GetCFOP() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestNaturezaOperacao_IsEntrada(t *testing.T) {
	tests := []struct {
		name         string
		tipoOperacao int
		expected     bool
	}{
		{"Entrada", 0, true},
		{"Saída", 1, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			natureza := &NaturezaOperacao{TipoOperacao: tt.tipoOperacao}
			result := natureza.IsEntrada()
			if result != tt.expected {
				t.Errorf("IsEntrada() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

// ============================================
// TESTES PARA MODELO PRODUTO
// ============================================

func TestProduto_IsNacional(t *testing.T) {
	tests := []struct {
		name          string
		origemProduto int
		expected      bool
	}{
		{"Nacional", 0, true},
		{"Estrangeiro", 1, false},
		{"Nacional com conteúdo importado", 3, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			produto := &Produto{OrigemProduto: tt.origemProduto}
			result := produto.IsNacional()
			if result != tt.expected {
				t.Errorf("IsNacional() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestProduto_GetCSTCompleto(t *testing.T) {
	tests := []struct {
		name          string
		origemProduto int
		csticms       string
		csosn         string
		expected      string
	}{
		{"Regime Normal", 0, "000", "", "0000"},
		{"Simples Nacional", 0, "000", "101", "101"},
		{"Estrangeiro Normal", 1, "020", "", "1020"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			produto := &Produto{
				OrigemProduto: tt.origemProduto,
				CSTICMS:       tt.csticms,
				CSOSN:         tt.csosn,
			}
			result := produto.GetCSTCompleto()
			if result != tt.expected {
				t.Errorf("GetCSTCompleto() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestProduto_CalcularImpostos(t *testing.T) {
	produto := &Produto{
		AliquotaICMS:     18.0,
		AliquotaIPI:      5.0,
		AliquotaPIS:      1.65,
		AliquotaCOFINS:   7.6,
		CalculaICMS:      true,
		CalculaIPI:       true,
		CalculaPIS:       true,
		CalculaCOFINS:    true,
		SubstituicaoTrib: false,
	}

	preco := 100.0
	impostos := produto.CalcularImpostos(preco)

	expectedICMS := 18.0
	expectedIPI := 5.0
	expectedPIS := 1.65
	expectedCOFINS := 7.6

	// Usar tolerância para comparação de float
	if abs(impostos["icms"]-expectedICMS) > 0.01 {
		t.Errorf("ICMS = %v, expected %v", impostos["icms"], expectedICMS)
	}
	if abs(impostos["ipi"]-expectedIPI) > 0.01 {
		t.Errorf("IPI = %v, expected %v", impostos["ipi"], expectedIPI)
	}
	if abs(impostos["pis"]-expectedPIS) > 0.01 {
		t.Errorf("PIS = %v, expected %v", impostos["pis"], expectedPIS)
	}
	if abs(impostos["cofins"]-expectedCOFINS) > 0.01 {
		t.Errorf("COFINS = %v, expected %v", impostos["cofins"], expectedCOFINS)
	}
}

func TestProduto_ValidarDadosFiscais(t *testing.T) {
	tests := []struct {
		name     string
		produto  Produto
		hasErros bool
	}{
		{
			name: "Produto válido",
			produto: Produto{
				NCM:           "12345678",
				CEST:          "1234567",
				OrigemProduto: 0,
				CSTICMS:       "000",
				CSOSN:         "101",
				AliquotaICMS:  18.0,
			},
			hasErros: false,
		},
		{
			name: "NCM inválido",
			produto: Produto{
				NCM:           "123", // Muito curto
				OrigemProduto: 0,
				AliquotaICMS:  18.0,
			},
			hasErros: true,
		},
		{
			name: "Origem inválida",
			produto: Produto{
				NCM:           "12345678",
				OrigemProduto: 10, // Fora do range
				AliquotaICMS:  18.0,
			},
			hasErros: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			erros := tt.produto.ValidarDadosFiscais()
			hasErros := len(erros) > 0
			if hasErros != tt.hasErros {
				t.Errorf("ValidarDadosFiscais() hasErros = %v, expected %v, erros: %v", hasErros, tt.hasErros, erros)
			}
		})
	}
}

// ============================================
// TESTES PARA MODELO VENDA
// ============================================

func TestVenda_IsPendente(t *testing.T) {
	venda := &Venda{Status: "pendente"}
	if !venda.IsPendente() {
		t.Errorf("IsPendente() = false, expected true")
	}
}

func TestVenda_CanEmitirNFCe(t *testing.T) {
	tests := []struct {
		name       string
		status     string
		nfceStatus string
		expected   bool
	}{
		{"Pode emitir", "finalizada", "nao_emitida", true},
		{"Não finalizada", "pendente", "nao_emitida", false},
		{"Já emitida", "finalizada", "autorizada", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			venda := &Venda{
				Status:     tt.status,
				NFCeStatus: tt.nfceStatus,
			}
			result := venda.CanEmitirNFCe()
			if result != tt.expected {
				t.Errorf("CanEmitirNFCe() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestVenda_GetDescricaoFormaPagamento(t *testing.T) {
	tests := []struct {
		name           string
		formaPagamento int
		expected       string
	}{
		{"Dinheiro", 1, "Dinheiro"},
		{"Cartão de Crédito", 3, "Cartão de Crédito"},
		{"PIX", 17, "Pagamento Instantâneo (PIX)"},
		{"Não informado", 999, "Não informado"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			venda := &Venda{FormaPagamento: tt.formaPagamento}
			result := venda.GetDescricaoFormaPagamento()
			if result != tt.expected {
				t.Errorf("GetDescricaoFormaPagamento() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestVenda_CalcularTotais(t *testing.T) {
	venda := &Venda{
		Itens: []ItemVenda{
			{ValorTotal: 100.0, ValorDesc: 10.0},
			{ValorTotal: 200.0, ValorDesc: 20.0},
		},
	}

	venda.CalcularTotais()

	expectedTotalProdutos := 300.0
	expectedTotalDesconto := 30.0
	expectedTotalVenda := 270.0

	if venda.TotalProdutos != expectedTotalProdutos {
		t.Errorf("TotalProdutos = %v, expected %v", venda.TotalProdutos, expectedTotalProdutos)
	}
	if venda.TotalDesconto != expectedTotalDesconto {
		t.Errorf("TotalDesconto = %v, expected %v", venda.TotalDesconto, expectedTotalDesconto)
	}
	if venda.TotalVenda != expectedTotalVenda {
		t.Errorf("TotalVenda = %v, expected %v", venda.TotalVenda, expectedTotalVenda)
	}
}
