package fiscal

import (
	"encoding/json"
	"fmt"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// NFCeService service específico para NFCe
type NFCeService struct {
	*BaseFiscalService
}

func NewNFCeService(db *gorm.DB) *NFCeService {
	return &NFCeService{
		BaseFiscalService: NewBaseFiscalService(db),
	}
}

// ============================================
// INTERFACE DOCUMENTOFISCALSERVICE
// ============================================

// Emitir emite uma NFCe
func (s *NFCeService) Emitir(dados interface{}) (*DocumentoFiscalResponse, error) {
	venda, ok := dados.(*models.Venda)
	if !ok {
		return nil, fmt.Errorf("dados inválidos para emissão de NFCe")
	}

	empresa, err := s.GetEmpresaPrincipal()
	if err != nil {
		return nil, err
	}

	return s.EmitirNFCe(venda, empresa)
}

// Cancelar cancela uma NFCe
func (s *NFCeService) Cancelar(chaveAcesso, justificativa string, empresa *models.Empresa) (*DocumentoFiscalResponse, error) {
	return s.CancelarNFCe(chaveAcesso, justificativa, empresa)
}

// ConsultarStatus consulta o status de uma NFCe
func (s *NFCeService) ConsultarStatus(chaveAcesso string, empresa *models.Empresa) (*StatusDocumentoResponse, error) {
	return s.ConsultarStatusNFCe(chaveAcesso, empresa)
}

// ============================================
// MÉTODOS ESPECÍFICOS PARA NFCe
// ============================================

// EmitirNFCe emite uma NFCe através do serviço fiscal C#
func (s *NFCeService) EmitirNFCe(venda *models.Venda, empresa *models.Empresa) (*DocumentoFiscalResponse, error) {
	// Validar dados
	if erros := s.validarDadosNFCe(venda, empresa); len(erros) > 0 {
		return &DocumentoFiscalResponse{
			Sucesso:  false,
			Mensagem: "Dados inválidos para emissão da NFCe",
			Erros:    erros,
		}, nil
	}

	// Montar request para o serviço C#
	request := s.montarNFCeRequest(venda, empresa)

	// Log da operação
	s.LogOperacao("NFCe", "Emissao", map[string]interface{}{
		"venda_id":     venda.ID,
		"numero_venda": venda.NumeroVenda,
		"empresa_cnpj": empresa.CNPJ,
	})

	// Fazer chamada HTTP para o serviço C#
	response, err := s.chamarServicoFiscal("POST", "/api/fiscal/nfce", request)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar serviço fiscal: %v", err)
	}

	// Converter resposta
	var nfceResponse DocumentoFiscalResponse
	if err := json.Unmarshal(response, &nfceResponse); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta do serviço fiscal: %v", err)
	}

	return &nfceResponse, nil
}

// CancelarNFCe cancela uma NFCe através do serviço fiscal C#
func (s *NFCeService) CancelarNFCe(chaveAcesso, justificativa string, empresa *models.Empresa) (*DocumentoFiscalResponse, error) {
	// Validar dados
	if chaveAcesso == "" {
		return &DocumentoFiscalResponse{
			Sucesso:  false,
			Mensagem: "Chave de acesso é obrigatória",
			Erros:    []string{"Chave de acesso não informada"},
		}, nil
	}

	if len(justificativa) < 15 {
		return &DocumentoFiscalResponse{
			Sucesso:  false,
			Mensagem: "Justificativa deve ter pelo menos 15 caracteres",
			Erros:    []string{"Justificativa muito curta"},
		}, nil
	}

	request := map[string]interface{}{
		"chave_acesso":  chaveAcesso,
		"justificativa": justificativa,
		"empresa":       s.MontarEmpresaData(empresa),
	}

	// Log da operação
	s.LogOperacao("NFCe", "Cancelamento", map[string]interface{}{
		"chave_acesso":  chaveAcesso,
		"justificativa": justificativa,
		"empresa_cnpj":  empresa.CNPJ,
	})

	response, err := s.chamarServicoFiscal("POST", "/api/fiscal/nfce/cancelar", request)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar serviço fiscal: %v", err)
	}

	var nfceResponse DocumentoFiscalResponse
	if err := json.Unmarshal(response, &nfceResponse); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta do serviço fiscal: %v", err)
	}

	return &nfceResponse, nil
}

// ConsultarStatusNFCe consulta o status de uma NFCe
func (s *NFCeService) ConsultarStatusNFCe(chaveAcesso string, empresa *models.Empresa) (*StatusDocumentoResponse, error) {
	if chaveAcesso == "" {
		return &StatusDocumentoResponse{
			Sucesso:  false,
			Mensagem: "Chave de acesso é obrigatória",
			Erros:    []string{"Chave de acesso não informada"},
		}, nil
	}

	request := map[string]interface{}{
		"chave_acesso": chaveAcesso,
		"empresa":      s.MontarEmpresaData(empresa),
	}

	response, err := s.chamarServicoFiscal("POST", "/api/fiscal/consultar-status", request)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar serviço fiscal: %v", err)
	}

	var statusResponse StatusDocumentoResponse
	if err := json.Unmarshal(response, &statusResponse); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta do serviço fiscal: %v", err)
	}

	return &statusResponse, nil
}

// ============================================
// MÉTODOS ESPECÍFICOS PARA LOTE NFCe
// ============================================

// ProcessarLoteNFCe processa um lote de NFCes pendentes
func (s *NFCeService) ProcessarLoteNFCe(vendas []models.Venda, empresa *models.Empresa) (*LoteNFCeResponse, error) {
	if len(vendas) == 0 {
		return &LoteNFCeResponse{
			TotalProcessadas: 0,
			Sucessos:         0,
			Erros:            0,
			Mensagem:         "Nenhuma venda para processar",
		}, nil
	}

	var sucessos, erros int
	var resultados []ResultadoItemLote

	for _, venda := range vendas {
		resultado := ResultadoItemLote{
			VendaID:     venda.ID,
			NumeroVenda: venda.NumeroVenda,
		}

		nfceResponse, err := s.EmitirNFCe(&venda, empresa)
		if err != nil {
			erros++
			resultado.Sucesso = false
			resultado.Erro = err.Error()
		} else {
			if nfceResponse.Sucesso {
				sucessos++
				resultado.Sucesso = true
				resultado.ChaveAcesso = nfceResponse.ChaveAcesso
				resultado.Numero = nfceResponse.Numero
			} else {
				erros++
				resultado.Sucesso = false
				resultado.Erro = nfceResponse.Mensagem
			}
		}

		resultados = append(resultados, resultado)
	}

	return &LoteNFCeResponse{
		TotalProcessadas: len(vendas),
		Sucessos:         sucessos,
		Erros:            erros,
		Resultados:       resultados,
		Mensagem:         fmt.Sprintf("Processadas %d vendas: %d sucessos, %d erros", len(vendas), sucessos, erros),
	}, nil
}

// ============================================
// MÉTODOS PRIVADOS
// ============================================

// validarDadosNFCe valida dados específicos para NFCe
func (s *NFCeService) validarDadosNFCe(venda *models.Venda, empresa *models.Empresa) []string {
	var erros []string

	// Validações comuns
	erros = append(erros, s.ValidarDadosComuns(empresa)...)

	// Validações específicas da venda
	if venda == nil {
		erros = append(erros, "Venda é obrigatória")
		return erros
	}

	if !venda.IsFinalizada() {
		erros = append(erros, "Venda deve estar finalizada")
	}

	if venda.NFCeStatus != "nao_emitida" {
		erros = append(erros, "NFCe já foi emitida para esta venda")
	}

	if len(venda.Itens) == 0 {
		erros = append(erros, "Venda deve ter pelo menos um item")
	}

	if venda.TotalVenda <= 0 {
		erros = append(erros, "Total da venda deve ser maior que zero")
	}

	// Validar itens
	for i, item := range venda.Itens {
		if item.Quantidade <= 0 {
			erros = append(erros, fmt.Sprintf("Quantidade do item %d deve ser maior que zero", i+1))
		}
		if item.ValorUnit <= 0 {
			erros = append(erros, fmt.Sprintf("Valor unitário do item %d deve ser maior que zero", i+1))
		}
		if item.Produto.Nome == "" {
			erros = append(erros, fmt.Sprintf("Nome do produto do item %d é obrigatório", i+1))
		}
	}

	return erros
}

// montarNFCeRequest monta o request para o serviço C#
func (s *NFCeService) montarNFCeRequest(venda *models.Venda, empresa *models.Empresa) map[string]interface{} {
	// Montar itens
	var itens []map[string]interface{}
	for _, item := range venda.Itens {
		itens = append(itens, s.MontarItemData(&item))
	}

	// Montar forma de pagamento
	formaPagamentoData := map[string]interface{}{
		"forma_pagamento": venda.FormaPagamento,
		"valor":           venda.ValorPago,
		"descricao":       venda.GetDescricaoFormaPagamento(),
	}

	// Montar request completo
	request := map[string]interface{}{
		"venda_id":              venda.ID,
		"numero_venda":          venda.NumeroVenda,
		"empresa":               s.MontarEmpresaData(empresa),
		"cliente":               s.MontarClienteData(venda.Cliente),
		"itens":                 itens,
		"total_produtos":        venda.TotalProdutos,
		"total_desconto":        venda.TotalDesconto,
		"total_venda":           venda.TotalVenda,
		"natureza_operacao":     s.MontarNaturezaOperacaoData(&venda.NaturezaOp),
		"forma_pagamento":       formaPagamentoData,
		"informacoes_adicionais": venda.Observacoes,
	}

	return request
}

// ============================================
// ESTRUTURAS DE RESPOSTA ESPECÍFICAS
// ============================================

// LoteNFCeResponse resposta para processamento em lote
type LoteNFCeResponse struct {
	TotalProcessadas int                  `json:"total_processadas"`
	Sucessos         int                  `json:"sucessos"`
	Erros            int                  `json:"erros"`
	Mensagem         string               `json:"mensagem"`
	Resultados       []ResultadoItemLote  `json:"resultados"`
}

// ResultadoItemLote resultado de um item do lote
type ResultadoItemLote struct {
	VendaID      uint    `json:"venda_id"`
	NumeroVenda  string  `json:"numero_venda"`
	Sucesso      bool    `json:"sucesso"`
	ChaveAcesso  *string `json:"chave_acesso,omitempty"`
	Numero       *string `json:"numero,omitempty"`
	Erro         string  `json:"erro,omitempty"`
}
