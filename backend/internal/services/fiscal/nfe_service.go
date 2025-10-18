package fiscal

import (
	"encoding/json"
	"fmt"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// NFeService service específico para NFe
type NFeService struct {
	*BaseFiscalService
}

func NewNFeService(db *gorm.DB) *NFeService {
	return &NFeService{
		BaseFiscalService: NewBaseFiscalService(db),
	}
}

// ============================================
// INTERFACE DOCUMENTOFISCALSERVICE
// ============================================

// Emitir emite uma NFe
func (s *NFeService) Emitir(dados interface{}) (*DocumentoFiscalResponse, error) {
	venda, ok := dados.(*models.Venda)
	if !ok {
		return nil, fmt.Errorf("dados inválidos para emissão de NFe")
	}

	empresa, err := s.GetEmpresaPrincipal()
	if err != nil {
		return nil, err
	}

	return s.EmitirNFe(venda, empresa)
}

// Cancelar cancela uma NFe
func (s *NFeService) Cancelar(chaveAcesso, justificativa string, empresa *models.Empresa) (*DocumentoFiscalResponse, error) {
	return s.CancelarNFe(chaveAcesso, justificativa, empresa)
}

// ConsultarStatus consulta o status de uma NFe
func (s *NFeService) ConsultarStatus(chaveAcesso string, empresa *models.Empresa) (*StatusDocumentoResponse, error) {
	return s.ConsultarStatusNFe(chaveAcesso, empresa)
}

// ============================================
// MÉTODOS ESPECÍFICOS PARA NFe
// ============================================

// EmitirNFe emite uma NFe através do serviço fiscal C#
func (s *NFeService) EmitirNFe(venda *models.Venda, empresa *models.Empresa) (*DocumentoFiscalResponse, error) {
	// Validar dados
	if erros := s.validarDadosNFe(venda, empresa); len(erros) > 0 {
		return &DocumentoFiscalResponse{
			Sucesso:  false,
			Mensagem: "Dados inválidos para emissão da NFe",
			Erros:    erros,
		}, nil
	}

	// Montar request para o serviço C#
	request := s.montarNFeRequest(venda, empresa)

	// Log da operação
	s.LogOperacao("NFe", "Emissao", map[string]interface{}{
		"venda_id":     venda.ID,
		"numero_venda": venda.NumeroVenda,
		"empresa_cnpj": empresa.CNPJ,
		"cliente_id":   venda.ClienteID,
	})

	// Fazer chamada HTTP para o serviço C#
	response, err := s.chamarServicoFiscal("POST", "/api/fiscal/nfe", request)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar serviço fiscal: %v", err)
	}

	// Converter resposta
	var nfeResponse DocumentoFiscalResponse
	if err := json.Unmarshal(response, &nfeResponse); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta do serviço fiscal: %v", err)
	}

	return &nfeResponse, nil
}

// CancelarNFe cancela uma NFe através do serviço fiscal C#
func (s *NFeService) CancelarNFe(chaveAcesso, justificativa string, empresa *models.Empresa) (*DocumentoFiscalResponse, error) {
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
	s.LogOperacao("NFe", "Cancelamento", map[string]interface{}{
		"chave_acesso":  chaveAcesso,
		"justificativa": justificativa,
		"empresa_cnpj":  empresa.CNPJ,
	})

	response, err := s.chamarServicoFiscal("POST", "/api/fiscal/nfe/cancelar", request)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar serviço fiscal: %v", err)
	}

	var nfeResponse DocumentoFiscalResponse
	if err := json.Unmarshal(response, &nfeResponse); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta do serviço fiscal: %v", err)
	}

	return &nfeResponse, nil
}

// ConsultarStatusNFe consulta o status de uma NFe
func (s *NFeService) ConsultarStatusNFe(chaveAcesso string, empresa *models.Empresa) (*StatusDocumentoResponse, error) {
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
// MÉTODOS ESPECÍFICOS PARA NFe
// ============================================

// EmitirNFeComTransporte emite NFe com dados de transporte
func (s *NFeService) EmitirNFeComTransporte(venda *models.Venda, empresa *models.Empresa, transporte *DadosTransporte) (*DocumentoFiscalResponse, error) {
	// Validar dados
	if erros := s.validarDadosNFe(venda, empresa); len(erros) > 0 {
		return &DocumentoFiscalResponse{
			Sucesso:  false,
			Mensagem: "Dados inválidos para emissão da NFe",
			Erros:    erros,
		}, nil
	}

	// Montar request com transporte
	request := s.montarNFeRequest(venda, empresa)
	if transporte != nil {
		request["transporte"] = s.montarDadosTransporte(transporte)
	}

	// Fazer chamada HTTP
	response, err := s.chamarServicoFiscal("POST", "/api/fiscal/nfe", request)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar serviço fiscal: %v", err)
	}

	var nfeResponse DocumentoFiscalResponse
	if err := json.Unmarshal(response, &nfeResponse); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta do serviço fiscal: %v", err)
	}

	return &nfeResponse, nil
}

// ============================================
// MÉTODOS PRIVADOS
// ============================================

// validarDadosNFe valida dados específicos para NFe
func (s *NFeService) validarDadosNFe(venda *models.Venda, empresa *models.Empresa) []string {
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

	// NFe sempre precisa de destinatário
	if venda.Cliente == nil {
		erros = append(erros, "NFe deve ter um destinatário (cliente)")
	} else {
		// Validar dados do cliente para NFe
		if venda.Cliente.CNPJ == "" && venda.Cliente.CPF == "" {
			erros = append(erros, "Cliente deve ter CPF ou CNPJ")
		}
		if venda.Cliente.Nome == "" {
			erros = append(erros, "Nome do cliente é obrigatório")
		}
		if venda.Cliente.Logradouro == "" {
			erros = append(erros, "Endereço do cliente é obrigatório para NFe")
		}
	}

	if len(venda.Itens) == 0 {
		erros = append(erros, "Venda deve ter pelo menos um item")
	}

	if venda.TotalVenda <= 0 {
		erros = append(erros, "Total da venda deve ser maior que zero")
	}

	// Validar itens com mais rigor para NFe
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
		if item.Produto.NCM == "" {
			erros = append(erros, fmt.Sprintf("NCM do produto do item %d é obrigatório para NFe", i+1))
		}
	}

	return erros
}

// montarNFeRequest monta o request para o serviço C#
func (s *NFeService) montarNFeRequest(venda *models.Venda, empresa *models.Empresa) map[string]interface{} {
	// Montar itens
	var itens []map[string]interface{}
	for _, item := range venda.Itens {
		itens = append(itens, s.MontarItemData(&item))
	}

	// NFe não tem forma de pagamento como NFCe, mas pode ter informações de cobrança
	// Por enquanto, vamos usar os dados básicos

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
		"informacoes_adicionais": venda.Observacoes,
	}

	return request
}

// montarDadosTransporte monta dados de transporte para NFe
func (s *NFeService) montarDadosTransporte(transporte *DadosTransporte) map[string]interface{} {
	return map[string]interface{}{
		"modalidade_frete":    transporte.ModalidadeFrete,
		"transportadora_cnpj": transporte.TransportadoraCNPJ,
		"transportadora_nome": transporte.TransportadoraNome,
		"veiculo":             transporte.Veiculo,
		"placa":               transporte.Placa,
		"uf":                  transporte.UF,
		"valor_frete":         transporte.ValorFrete,
		"valor_seguro":        transporte.ValorSeguro,
	}
}

// ============================================
// ESTRUTURAS ESPECÍFICAS PARA NFe
// ============================================

// DadosTransporte dados de transporte para NFe
type DadosTransporte struct {
	ModalidadeFrete     int     `json:"modalidade_frete"`     // 0=Emitente, 1=Destinatário, 2=Terceiros, 9=Sem frete
	TransportadoraCNPJ  string  `json:"transportadora_cnpj"`
	TransportadoraNome  string  `json:"transportadora_nome"`
	Veiculo             string  `json:"veiculo"`
	Placa               string  `json:"placa"`
	UF                  string  `json:"uf"`
	ValorFrete          float64 `json:"valor_frete"`
	ValorSeguro         float64 `json:"valor_seguro"`
}

// DadosCobranca dados de cobrança para NFe
type DadosCobranca struct {
	NumeroFatura string           `json:"numero_fatura"`
	ValorOriginal float64         `json:"valor_original"`
	ValorDesconto float64         `json:"valor_desconto"`
	ValorLiquido  float64         `json:"valor_liquido"`
	Duplicatas    []DadosDuplicata `json:"duplicatas"`
}

// DadosDuplicata dados de uma duplicata
type DadosDuplicata struct {
	Numero         string  `json:"numero"`
	DataVencimento string  `json:"data_vencimento"` // YYYY-MM-DD
	Valor          float64 `json:"valor"`
}
