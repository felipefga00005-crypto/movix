package fiscal

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

// BaseFiscalService contém funcionalidades comuns para todos os documentos fiscais
type BaseFiscalService struct {
	db               *gorm.DB
	fiscalServiceURL string
	httpClient       *http.Client
}

func NewBaseFiscalService(db *gorm.DB) *BaseFiscalService {
	return &BaseFiscalService{
		db:               db,
		fiscalServiceURL: "http://localhost:8081", // URL do serviço C#
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// ============================================
// MÉTODOS COMUNS
// ============================================

// GetEmpresaPrincipal busca a empresa principal configurada
func (s *BaseFiscalService) GetEmpresaPrincipal() (*models.Empresa, error) {
	var empresa models.Empresa
	err := s.db.Where("ativo = ?", true).First(&empresa).Error
	if err != nil {
		return nil, fmt.Errorf("empresa não configurada: %v", err)
	}
	return &empresa, nil
}

// TestarConectividade testa a conectividade com o serviço fiscal C#
func (s *BaseFiscalService) TestarConectividade() error {
	_, err := s.chamarServicoFiscal("GET", "/health", nil)
	return err
}

// ValidarCertificado valida um certificado digital
func (s *BaseFiscalService) ValidarCertificado(certificadoBase64, senha string) (map[string]interface{}, error) {
	request := map[string]interface{}{
		"certificadoBase64": certificadoBase64,
		"senha":             senha,
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
// MÉTODOS PARA MONTAGEM DE DADOS COMUNS
// ============================================

// MontarEmpresaData converte modelo Empresa para dados do serviço fiscal
func (s *BaseFiscalService) MontarEmpresaData(empresa *models.Empresa) map[string]interface{} {
	return map[string]interface{}{
		"razao_social":        empresa.RazaoSocial,
		"nome_fantasia":       empresa.NomeFantasia,
		"cnpj":                empresa.CNPJ,
		"inscricao_estadual":  empresa.InscricaoEstadual,
		"inscricao_municipal": empresa.InscricaoMunicipal,
		"logradouro":          empresa.Logradouro,
		"numero":              empresa.Numero,
		"complemento":         empresa.Complemento,
		"bairro":              empresa.Bairro,
		"cep":                 empresa.CEP,
		"uf":                  empresa.UF,
		"cidade_id":           empresa.CidadeID,
		"telefone":            empresa.Telefone,
		"email":               empresa.Email,
		"regime_tributario":   empresa.CRT,
		"ambiente_nfe":        empresa.AmbienteNFe,
		"serie_nfe":           empresa.SerieNFe,
		"serie_nfce":          empresa.SerieNFCe,
		"certificado_a1":      empresa.CertificadoA1,
		"senha_certificado":   empresa.SenhaCertificado,
	}
}

// MontarClienteData converte modelo Cliente para dados do serviço fiscal
func (s *BaseFiscalService) MontarClienteData(cliente *models.Cliente) map[string]interface{} {
	if cliente == nil {
		return nil
	}

	indIEDest := 9 // Não contribuinte por padrão
	if cliente.InscricaoEstadual != "" {
		indIEDest = 1 // Contribuinte
	}

	return map[string]interface{}{
		"nome":               cliente.Nome,
		"email":              cliente.Email,
		"cpf":                cliente.CPF,
		"cnpj":               cliente.CNPJ,
		"inscricao_estadual": cliente.InscricaoEstadual,
		"telefone":           cliente.Telefone,
		"logradouro":         cliente.Logradouro,
		"numero":             cliente.Numero,
		"complemento":        cliente.Complemento,
		"bairro":             cliente.Bairro,
		"cep":                cliente.CEP,
		"uf":                 cliente.UF,
		"cidade_id":          cliente.CidadeID,
		"ind_ie_dest":        indIEDest,
	}
}

// MontarNaturezaOperacaoData converte modelo NaturezaOperacao para dados do serviço fiscal
func (s *BaseFiscalService) MontarNaturezaOperacaoData(naturezaOp *models.NaturezaOperacao) map[string]interface{} {
	return map[string]interface{}{
		"codigo":             naturezaOp.Codigo,
		"descricao":          naturezaOp.Descricao,
		"cfop_dentro_estado": naturezaOp.CFOPDentroEstado,
		"cfop_fora_estado":   naturezaOp.CFOPForaEstado,
		"cfop_exterior":      naturezaOp.CFOPExterior,
		"finalidade_nfe":     naturezaOp.FinalidadeNFe,
		"tipo_operacao":      naturezaOp.TipoOperacao,
	}
}

// MontarItemData converte ItemVenda para dados do serviço fiscal
func (s *BaseFiscalService) MontarItemData(item *models.ItemVenda) map[string]interface{} {
	return map[string]interface{}{
		"produto_id":      item.ProdutoID,
		"nome":            item.Produto.Nome,
		"codigo":          item.Produto.Codigo,
		"quantidade":      item.Quantidade,
		"unidade":         item.Produto.Unidade,
		"valor_unitario":  item.ValorUnit,
		"valor_desconto":  item.ValorDesc,
		"valor_total":     item.ValorTotal,
		"ncm":             item.Produto.NCM,
		"cest":            item.Produto.CEST,
		"origem_produto":  item.Produto.OrigemProduto,
		"cst_icms":        item.Produto.CSTICMS,
		"csosn":           item.Produto.CSOSN,
		"aliquota_icms":   item.Produto.AliquotaICMS,
		"aliquota_ipi":    item.Produto.AliquotaIPI,
		"aliquota_pis":    item.Produto.AliquotaPIS,
		"aliquota_cofins": item.Produto.AliquotaCOFINS,
		"calcula_icms":    item.Produto.CalculaICMS,
		"calcula_ipi":     item.Produto.CalculaIPI,
		"calcula_pis":     item.Produto.CalculaPIS,
		"calcula_cofins":  item.Produto.CalculaCOFINS,
	}
}

// ============================================
// COMUNICAÇÃO HTTP COM SERVIÇO C#
// ============================================

// chamarServicoFiscal faz chamadas HTTP para o serviço fiscal C#
func (s *BaseFiscalService) chamarServicoFiscal(method, endpoint string, data interface{}) ([]byte, error) {
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

// ============================================
// INTERFACES PARA DOCUMENTOS FISCAIS
// ============================================

// DocumentoFiscalService interface comum para todos os documentos fiscais
type DocumentoFiscalService interface {
	Emitir(dados interface{}) (*models.DocumentoFiscalResponse, error)
	Cancelar(chaveAcesso, justificativa string, empresa *models.Empresa) (*models.DocumentoFiscalResponse, error)
	ConsultarStatus(chaveAcesso string, empresa *models.Empresa) (*models.StatusDocumentoResponse, error)
}

// ============================================
// ESTRUTURAS DE RESPOSTA COMUNS
// ============================================

// DocumentoFiscalResponse resposta padrão para operações fiscais
type DocumentoFiscalResponse struct {
	Sucesso           bool                   `json:"sucesso"`
	Mensagem          string                 `json:"mensagem"`
	ChaveAcesso       *string                `json:"chave_acesso"`
	Numero            *string                `json:"numero"`
	Serie             *string                `json:"serie"`
	ProtocoloAut      *string                `json:"protocolo_autorizacao"`
	DataAutorizacao   *time.Time             `json:"data_autorizacao"`
	Status            string                 `json:"status"`
	XML               *string                `json:"xml"`
	XMLRetorno        *string                `json:"xml_retorno"`
	Erros             []string               `json:"erros,omitempty"`
	Avisos            []string               `json:"avisos,omitempty"`
	DadosAdicionais   map[string]interface{} `json:"dados_adicionais,omitempty"`
}

// StatusDocumentoResponse resposta para consulta de status
type StatusDocumentoResponse struct {
	Sucesso         bool       `json:"sucesso"`
	Mensagem        string     `json:"mensagem"`
	ChaveAcesso     string     `json:"chave_acesso"`
	Status          string     `json:"status"`
	ProtocoloAut    *string    `json:"protocolo_autorizacao"`
	DataConsulta    *time.Time `json:"data_consulta"`
	XMLRetorno      *string    `json:"xml_retorno"`
	Erros           []string   `json:"erros,omitempty"`
}

// ============================================
// UTILITÁRIOS
// ============================================

// LogOperacao registra operações fiscais para auditoria
func (s *BaseFiscalService) LogOperacao(tipoDoc, operacao string, dadosOperacao map[string]interface{}) {
	// Implementar log de auditoria fiscal
	// Por enquanto, apenas placeholder
}

// ValidarDadosComuns valida dados comuns a todos os documentos
func (s *BaseFiscalService) ValidarDadosComuns(empresa *models.Empresa) []string {
	var erros []string

	if empresa == nil {
		erros = append(erros, "Empresa é obrigatória")
		return erros
	}

	if empresa.CNPJ == "" {
		erros = append(erros, "CNPJ da empresa é obrigatório")
	}

	if empresa.CertificadoA1 == "" {
		erros = append(erros, "Certificado digital é obrigatório")
	}

	if empresa.SenhaCertificado == "" {
		erros = append(erros, "Senha do certificado é obrigatória")
	}

	if empresa.UF == "" {
		erros = append(erros, "UF da empresa é obrigatória")
	}

	return erros
}
