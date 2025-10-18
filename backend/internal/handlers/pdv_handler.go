package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/services"
)

type PDVHandler struct {
	vendaService *services.VendaService
}

func NewPDVHandler(vendaService *services.VendaService) *PDVHandler {
	return &PDVHandler{
		vendaService: vendaService,
	}
}

// ============================================
// OPERAÇÕES DO CAIXA
// ============================================

// AbrirCaixa abre o caixa do PDV
func (h *PDVHandler) AbrirCaixa(c *gin.Context) {
	// TODO: Implementar abertura de caixa
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Abertura de caixa não implementada ainda"})
}

// FecharCaixa fecha o caixa do PDV
func (h *PDVHandler) FecharCaixa(c *gin.Context) {
	// TODO: Implementar fechamento de caixa
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Fechamento de caixa não implementado ainda"})
}

// StatusCaixa retorna o status atual do caixa
func (h *PDVHandler) StatusCaixa(c *gin.Context) {
	// TODO: Implementar status do caixa
	c.JSON(http.StatusOK, gin.H{
		"status":      "aberto",
		"data_abertura": "2024-01-15T08:00:00Z",
		"valor_inicial": 100.00,
		"valor_atual":   250.00,
		"total_vendas":  150.00,
		"operador":      "João Silva",
	})
}

// MovimentacaoCaixa retorna a movimentação do caixa
func (h *PDVHandler) MovimentacaoCaixa(c *gin.Context) {
	// TODO: Implementar movimentação do caixa
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Movimentação de caixa não implementada ainda"})
}

// SangriaCaixa realiza sangria do caixa
func (h *PDVHandler) SangriaCaixa(c *gin.Context) {
	// TODO: Implementar sangria
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Sangria não implementada ainda"})
}

// SuprimentoCaixa realiza suprimento do caixa
func (h *PDVHandler) SuprimentoCaixa(c *gin.Context) {
	// TODO: Implementar suprimento
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Suprimento não implementado ainda"})
}

// ============================================
// OPERAÇÕES DE VENDA RÁPIDA
// ============================================

// VendaRapida cria e finaliza uma venda rapidamente
func (h *PDVHandler) VendaRapida(c *gin.Context) {
	var request models.CreateVendaRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Obter ID do usuário do contexto
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	// Criar venda
	venda, err := h.vendaService.CreateVenda(userID.(uint), request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Finalizar venda automaticamente
	finalizarRequest := models.FinalizarVendaRequest{
		FormaPagamento: request.FormaPagamento,
		ValorPago:      request.ValorPago,
	}

	vendaFinalizada, err := h.vendaService.FinalizarVenda(venda.ID, finalizarRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := h.vendaService.ConvertToResponse(vendaFinalizada)
	c.JSON(http.StatusCreated, response)
}

// EmitirNFCeVenda emite NFCe para uma venda do PDV
func (h *PDVHandler) EmitirNFCeVenda(c *gin.Context) {
	// TODO: Implementar emissão de NFCe no PDV
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Emissão de NFCe no PDV não implementada ainda"})
}

// ImprimirCupom imprime cupom da venda
func (h *PDVHandler) ImprimirCupom(c *gin.Context) {
	// TODO: Implementar impressão de cupom
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Impressão de cupom não implementada ainda"})
}

// ============================================
// CONSULTAS RÁPIDAS PARA PDV
// ============================================

// BuscarProdutos busca produtos para o PDV
func (h *PDVHandler) BuscarProdutos(c *gin.Context) {
	query := c.Query("q")
	limitStr := c.DefaultQuery("limit", "10")
	
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	// TODO: Implementar busca de produtos
	// Por enquanto, retorna dados simulados
	produtos := []gin.H{
		{
			"id":     1,
			"nome":   "Produto Teste 1",
			"codigo": "001",
			"preco":  10.50,
			"estoque": 100,
		},
		{
			"id":     2,
			"nome":   "Produto Teste 2", 
			"codigo": "002",
			"preco":  25.00,
			"estoque": 50,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  produtos,
		"query": query,
		"limit": limit,
	})
}

// BuscarProdutoPorCodigo busca produto por código
func (h *PDVHandler) BuscarProdutoPorCodigo(c *gin.Context) {
	codigo := c.Param("codigo")
	
	// TODO: Implementar busca por código
	// Por enquanto, retorna dados simulados
	if codigo == "001" {
		c.JSON(http.StatusOK, gin.H{
			"id":     1,
			"nome":   "Produto Teste 1",
			"codigo": "001",
			"preco":  10.50,
			"estoque": 100,
			"ncm":    "12345678",
			"unidade": "UN",
		})
	} else {
		c.JSON(http.StatusNotFound, gin.H{"error": "Produto não encontrado"})
	}
}

// BuscarClientes busca clientes para o PDV
func (h *PDVHandler) BuscarClientes(c *gin.Context) {
	query := c.Query("q")
	limitStr := c.DefaultQuery("limit", "10")
	
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	// TODO: Implementar busca de clientes
	// Por enquanto, retorna dados simulados
	clientes := []gin.H{
		{
			"id":    1,
			"nome":  "Cliente Teste 1",
			"cpf":   "123.456.789-00",
			"email": "cliente1@teste.com",
		},
		{
			"id":    2,
			"nome":  "Cliente Teste 2",
			"cpf":   "987.654.321-00", 
			"email": "cliente2@teste.com",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  clientes,
		"query": query,
		"limit": limit,
	})
}

// BuscarClientePorCPF busca cliente por CPF
func (h *PDVHandler) BuscarClientePorCPF(c *gin.Context) {
	cpf := c.Param("cpf")
	
	// TODO: Implementar busca por CPF
	// Por enquanto, retorna dados simulados
	if cpf == "12345678900" || cpf == "123.456.789-00" {
		c.JSON(http.StatusOK, gin.H{
			"id":       1,
			"nome":     "Cliente Teste",
			"cpf":      "123.456.789-00",
			"email":    "cliente@teste.com",
			"telefone": "(11) 99999-9999",
		})
	} else {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cliente não encontrado"})
	}
}

// ============================================
// CONFIGURAÇÕES DO PDV
// ============================================

// GetFormasPagamento retorna formas de pagamento disponíveis
func (h *PDVHandler) GetFormasPagamento(c *gin.Context) {
	formas := []gin.H{
		{"codigo": 1, "descricao": "Dinheiro"},
		{"codigo": 2, "descricao": "Cheque"},
		{"codigo": 3, "descricao": "Cartão de Crédito"},
		{"codigo": 4, "descricao": "Cartão de Débito"},
		{"codigo": 17, "descricao": "PIX"},
		{"codigo": 99, "descricao": "Outros"},
	}

	c.JSON(http.StatusOK, gin.H{
		"data": formas,
	})
}

// GetNaturezasOperacao retorna naturezas de operação disponíveis
func (h *PDVHandler) GetNaturezasOperacao(c *gin.Context) {
	// TODO: Buscar do banco de dados
	naturezas := []gin.H{
		{
			"id":        1,
			"codigo":    "001",
			"descricao": "Venda",
			"cfop_dentro_estado": "5102",
			"cfop_fora_estado":   "6102",
		},
		{
			"id":        2,
			"codigo":    "002", 
			"descricao": "Venda de Produção",
			"cfop_dentro_estado": "5101",
			"cfop_fora_estado":   "6101",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"data": naturezas,
	})
}

// GetImpressoras retorna impressoras disponíveis
func (h *PDVHandler) GetImpressoras(c *gin.Context) {
	// TODO: Implementar listagem de impressoras
	impressoras := []gin.H{
		{
			"nome":   "Impressora Térmica 1",
			"tipo":   "termica",
			"status": "online",
		},
		{
			"nome":   "Impressora Laser",
			"tipo":   "laser",
			"status": "offline",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"data": impressoras,
	})
}

// TesteImpressora testa uma impressora
func (h *PDVHandler) TesteImpressora(c *gin.Context) {
	var request struct {
		NomeImpressora string `json:"nome_impressora" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implementar teste de impressora
	c.JSON(http.StatusOK, gin.H{
		"sucesso":  true,
		"mensagem": "Teste de impressão enviado com sucesso",
		"impressora": request.NomeImpressora,
	})
}

// ============================================
// ESTATÍSTICAS DO PDV
// ============================================

// VendasHoje retorna vendas do dia atual
func (h *PDVHandler) VendasHoje(c *gin.Context) {
	// TODO: Implementar vendas do dia
	c.JSON(http.StatusOK, gin.H{
		"total_vendas":  15,
		"valor_total":   1250.00,
		"ticket_medio":  83.33,
		"vendas_nfce":   12,
		"vendas_sem_nf": 3,
	})
}

// MetaVendas retorna informações sobre meta de vendas
func (h *PDVHandler) MetaVendas(c *gin.Context) {
	// TODO: Implementar meta de vendas
	c.JSON(http.StatusOK, gin.H{
		"meta_diaria":     2000.00,
		"vendido_hoje":    1250.00,
		"percentual":      62.5,
		"falta_vender":    750.00,
		"status":          "em_andamento",
	})
}

// ProdutosMaisVendidos retorna produtos mais vendidos
func (h *PDVHandler) ProdutosMaisVendidos(c *gin.Context) {
	// TODO: Implementar produtos mais vendidos
	produtos := []gin.H{
		{
			"produto_id":   1,
			"nome":         "Produto A",
			"quantidade":   25,
			"valor_total":  500.00,
		},
		{
			"produto_id":   2,
			"nome":         "Produto B", 
			"quantidade":   18,
			"valor_total":  360.00,
		},
		{
			"produto_id":   3,
			"nome":         "Produto C",
			"quantidade":   12,
			"valor_total":  240.00,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"data": produtos,
	})
}
