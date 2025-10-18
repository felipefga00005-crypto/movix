package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type FiscalService struct {
	db                *gorm.DB
	fiscalServiceURL  string
	httpClient        *http.Client
}

func NewFiscalService(db *gorm.DB) *FiscalService {
	return &FiscalService{
		db:               db,
		fiscalServiceURL: "http://localhost:8081", // URL do serviço C#
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// EmitirNFCe emite uma NFCe através do serviço fiscal C#
func (s *FiscalService) EmitirNFCe(venda *models.Venda, empresa *models.Empresa) (*models.NFCeResponse, error) {
	// Montar request para o serviço C#
	request := s.montarNFCeRequest(venda, empresa)
	
	// Fazer chamada HTTP para o serviço C#
	response, err := s.chamarServicoFiscal("POST", "/api/fiscal/nfce", request)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar serviço fiscal: %v", err)
	}

	// Converter resposta
	var nfceResponse models.NFCeResponse
	if err := json.Unmarshal(response, &nfceResponse); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta do serviço fiscal: %v", err)
	}

	return &nfceResponse, nil
}

// CancelarNFCe cancela uma NFCe através do serviço fiscal C#
func (s *FiscalService) CancelarNFCe(venda *models.Venda, empresa *models.Empresa, justificativa string) (*models.NFCeResponse, error) {
	if venda.NFCeChave == nil {
		return nil, fmt.Errorf("venda não possui chave de NFCe")
	}

	request := map[string]interface{}{
		"chave_acesso": *venda.NFCeChave,
		"justificativa": justificativa,
		"empresa": s.montarEmpresaData(empresa),
	}

	response, err := s.chamarServicoFiscal("POST", "/api/fiscal/nfce/cancelar", request)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar serviço fiscal: %v", err)
	}

	var nfceResponse models.NFCeResponse
	if err := json.Unmarshal(response, &nfceResponse); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta do serviço fiscal: %v", err)
	}

	return &nfceResponse, nil
}

// ConsultarStatusNFCe consulta o status de uma NFCe
func (s *FiscalService) ConsultarStatusNFCe(chaveAcesso string, empresa *models.Empresa) (map[string]interface{}, error) {
	request := map[string]interface{}{
		"chave_acesso": chaveAcesso,
		"empresa": s.montarEmpresaData(empresa),
	}

	response, err := s.chamarServicoFiscal("POST", "/api/fiscal/consultar-status", request)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar serviço fiscal: %v", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(response, &result); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta do serviço fiscal: %v", err)
	}

	return result, nil
}

// TestarConectividade testa a conectividade com o serviço fiscal
func (s *FiscalService) TestarConectividade() error {
	_, err := s.chamarServicoFiscal("GET", "/health", nil)
	return err
}

// ValidarCertificado valida um certificado digital
func (s *FiscalService) ValidarCertificado(certificadoBase64, senha string) (map[string]interface{}, error) {
	request := map[string]interface{}{
		"certificadoBase64": certificadoBase64,
		"senha": senha,
	}

	response, err := s.chamarServicoFiscal("POST", "/api/fiscal/validar-certificado", request)
	if err != nil {
		return nil, fmt.Errorf("erro ao validar certificado: %v", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(response, &result); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta: %v", err)
	}

	return result, nil
}

// ============================================
// MÉTODOS PRIVADOS
// ============================================

func (s *FiscalService) montarNFCeRequest(venda *models.Venda, empresa *models.Empresa) map[string]interface{} {
	// Montar dados da empresa
	empresaData := s.montarEmpresaData(empresa)

	// Montar dados do cliente (se houver)
	var clienteData map[string]interface{}
	if venda.Cliente != nil {
		clienteData = map[string]interface{}{
			"nome":  venda.Cliente.Nome,
			"email": venda.Cliente.Email,
			"cpf":   venda.Cliente.CPF,
			"cnpj":  venda.Cliente.CNPJ,
			"inscricao_estadual": venda.Cliente.InscricaoEstadual,
			"telefone": venda.Cliente.Telefone,
			"logradouro": venda.Cliente.Logradouro,
			"numero": venda.Cliente.Numero,
			"complemento": venda.Cliente.Complemento,
			"bairro": venda.Cliente.Bairro,
			"cep": venda.Cliente.CEP,
			"uf": venda.Cliente.UF,
			"cidade_id": venda.Cliente.CidadeID,
			"ind_ie_dest": 9, // Não contribuinte por padrão
		}
	}

	// Montar itens
	var itens []map[string]interface{}
	for _, item := range venda.Itens {
		itemData := map[string]interface{}{
			"produto_id":     item.ProdutoID,
			"nome":           item.Produto.Nome,
			"codigo":         item.Produto.Codigo,
			"quantidade":     item.Quantidade,
			"unidade":        item.Produto.Unidade,
			"valor_unitario": item.ValorUnit,
			"valor_desconto": item.ValorDesc,
			"valor_total":    item.ValorTotal,
			"ncm":            item.Produto.NCM,
			"cest":           item.Produto.CEST,
			"origem_produto": item.Produto.OrigemProduto,
			"cst_icms":       item.Produto.CSTICMS,
			"csosn":          item.Produto.CSOSN,
			"aliquota_icms":  item.Produto.AliquotaICMS,
			"aliquota_ipi":   item.Produto.AliquotaIPI,
			"aliquota_pis":   item.Produto.AliquotaPIS,
			"aliquota_cofins": item.Produto.AliquotaCOFINS,
			"calcula_icms":   item.Produto.CalculaICMS,
			"calcula_ipi":    item.Produto.CalculaIPI,
			"calcula_pis":    item.Produto.CalculaPIS,
			"calcula_cofins": item.Produto.CalculaCOFINS,
		}
		itens = append(itens, itemData)
	}

	// Montar natureza de operação
	naturezaOpData := map[string]interface{}{
		"codigo":             venda.NaturezaOp.Codigo,
		"descricao":          venda.NaturezaOp.Descricao,
		"cfop_dentro_estado": venda.NaturezaOp.CFOPDentroEstado,
		"cfop_fora_estado":   venda.NaturezaOp.CFOPForaEstado,
		"cfop_exterior":      venda.NaturezaOp.CFOPExterior,
		"finalidade_nfe":     venda.NaturezaOp.FinalidadeNFe,
	}

	// Montar forma de pagamento
	formaPagamentoData := map[string]interface{}{
		"forma_pagamento": venda.FormaPagamento,
		"valor":           venda.ValorPago,
		"descricao":       venda.GetDescricaoFormaPagamento(),
	}

	// Montar request completo
	request := map[string]interface{}{
		"venda_id":           venda.ID,
		"numero_venda":       venda.NumeroVenda,
		"empresa":            empresaData,
		"cliente":            clienteData,
		"itens":              itens,
		"total_produtos":     venda.TotalProdutos,
		"total_desconto":     venda.TotalDesconto,
		"total_venda":        venda.TotalVenda,
		"natureza_operacao":  naturezaOpData,
		"forma_pagamento":    formaPagamentoData,
		"informacoes_adicionais": venda.Observacoes,
	}

	return request
}

func (s *FiscalService) montarEmpresaData(empresa *models.Empresa) map[string]interface{} {
	return map[string]interface{}{
		"razao_social":       empresa.RazaoSocial,
		"nome_fantasia":      empresa.NomeFantasia,
		"cnpj":               empresa.CNPJ,
		"inscricao_estadual": empresa.InscricaoEstadual,
		"inscricao_municipal": empresa.InscricaoMunicipal,
		"logradouro":         empresa.Logradouro,
		"numero":             empresa.Numero,
		"complemento":        empresa.Complemento,
		"bairro":             empresa.Bairro,
		"cep":                empresa.CEP,
		"uf":                 empresa.UF,
		"cidade_id":          empresa.CidadeID,
		"telefone":           empresa.Telefone,
		"email":              empresa.Email,
		"regime_tributario":  empresa.CRT,
		"ambiente_nfe":       empresa.AmbienteNFe,
		"serie_nfe":          empresa.SerieNFe,
		"serie_nfce":         empresa.SerieNFCe,
		"certificado_a1":     empresa.CertificadoA1,
		"senha_certificado":  empresa.SenhaCertificado,
	}
}

func (s *FiscalService) chamarServicoFiscal(method, endpoint string, data interface{}) ([]byte, error) {
	url := s.fiscalServiceURL + endpoint
	
	var body io.Reader
	if data != nil {
		jsonData, err := json.Marshal(data)
		if err != nil {
			return nil, fmt.Errorf("erro ao serializar dados: %v", err)
		}
		body = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar request: %v", err)
	}

	if data != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erro ao fazer request HTTP: %v", err)
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("erro ao ler resposta: %v", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("erro HTTP %d: %s", resp.StatusCode, string(responseBody))
	}

	return responseBody, nil
}
