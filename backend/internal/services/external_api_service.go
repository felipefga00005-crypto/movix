package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// ============================================
// ESTRUTURAS DE DADOS
// ============================================

// CEP Response da BrasilAPI
type CEPResponse struct {
	CEP      string `json:"cep"`
	State    string `json:"state"`
	City     string `json:"city"`
	District string `json:"district"`
	Street   string `json:"street"`
	Service  string `json:"service"`
	Location *struct {
		Type        string `json:"type"`
		Coordinates struct {
			Longitude string `json:"longitude"`
			Latitude  string `json:"latitude"`
		} `json:"coordinates"`
	} `json:"location,omitempty"`
}

// ViaCEP Response (fallback)
type ViaCEPResponse struct {
	CEP         string `json:"cep"`
	Logradouro  string `json:"logradouro"`
	Complemento string `json:"complemento"`
	Bairro      string `json:"bairro"`
	Localidade  string `json:"localidade"`
	UF          string `json:"uf"`
	IBGE        string `json:"ibge"`
	DDD         string `json:"ddd"`
	Erro        bool   `json:"erro,omitempty"`
}

// Endereço unificado
type Endereco struct {
	CEP         string  `json:"cep"`
	Logradouro  string  `json:"logradouro"`
	Numero      string  `json:"numero,omitempty"`
	Complemento string  `json:"complemento,omitempty"`
	Bairro      string  `json:"bairro"`
	Cidade      string  `json:"cidade"`
	Estado      string  `json:"estado"`
	CodigoIBGE  string  `json:"codigo_ibge,omitempty"`
	Latitude    *string `json:"latitude,omitempty"`
	Longitude   *string `json:"longitude,omitempty"`
	DDD         string  `json:"ddd,omitempty"`
}

// CNPJ QSA
type QSA struct {
	NomeSocio                           string `json:"nome_socio"`
	QualificacaoSocio                   string `json:"qualificacao_socio"`
	FaixaEtaria                         string `json:"faixa_etaria"`
	CNPJCPFSocio                        string `json:"cnpj_cpf_do_socio"`
	DataEntradaSociedade                string `json:"data_entrada_sociedade"`
	IdentificadorSocio                  int    `json:"identificador_de_socio"`
	CPFRepresentanteLegal               string `json:"cpf_representante_legal,omitempty"`
	NomeRepresentanteLegal              string `json:"nome_representante_legal,omitempty"`
	QualificacaoRepresentanteLegal      string `json:"qualificacao_representante_legal,omitempty"`
}

// CNPJ Response - Estrutura atualizada conforme CNPJ.WS
type CNPJResponse struct {
	CNPJRaiz                string                 `json:"cnpj_raiz"`
	RazaoSocial             string                 `json:"razao_social"`
	CapitalSocial           string                 `json:"capital_social"`
	ResponsavelFederativo   string                 `json:"responsavel_federativo"`
	AtualizadoEm            string                 `json:"atualizado_em"`
	Porte                   CNPJPorte              `json:"porte"`
	NaturezaJuridica        CNPJNaturezaJuridica   `json:"natureza_juridica"`
	QualificacaoResponsavel CNPJQualificacao       `json:"qualificacao_do_responsavel"`
	Socios                  []CNPJSocio            `json:"socios"`
	Simples                 CNPJSimples            `json:"simples"`
	Estabelecimento         CNPJEstabelecimento    `json:"estabelecimento"`
}

type CNPJPorte struct {
	ID        string `json:"id"`
	Descricao string `json:"descricao"`
}

type CNPJNaturezaJuridica struct {
	ID        string `json:"id"`
	Descricao string `json:"descricao"`
}

type CNPJQualificacao struct {
	ID        int    `json:"id"`
	Descricao string `json:"descricao"`
}

type CNPJSocio struct {
	CPFCNPJSocio            string           `json:"cpf_cnpj_socio"`
	Nome                    string           `json:"nome"`
	Tipo                    string           `json:"tipo"`
	DataEntrada             string           `json:"data_entrada"`
	CPFRepresentanteLegal   string           `json:"cpf_representante_legal"`
	NomeRepresentante       *string          `json:"nome_representante"`
	FaixaEtaria             string           `json:"faixa_etaria"`
	AtualizadoEm            string           `json:"atualizado_em"`
	PaisID                  string           `json:"pais_id"`
	QualificacaoSocio       CNPJQualificacao `json:"qualificacao_socio"`
	QualificacaoRepresentante *CNPJQualificacao `json:"qualificacao_representante"`
	Pais                    CNPJPais         `json:"pais"`
}

type CNPJSimples struct {
	Simples             string  `json:"simples"`
	DataOpcaoSimples    *string `json:"data_opcao_simples"`
	DataExclusaoSimples *string `json:"data_exclusao_simples"`
	MEI                 string  `json:"mei"`
	DataOpcaoMEI        *string `json:"data_opcao_mei"`
	DataExclusaoMEI     *string `json:"data_exclusao_mei"`
	AtualizadoEm        string  `json:"atualizado_em"`
}

type CNPJEstabelecimento struct {
	CNPJ                     string                    `json:"cnpj"`
	AtividadesSecundarias    []CNPJAtividade           `json:"atividades_secundarias"`
	CNPJRaiz                 string                    `json:"cnpj_raiz"`
	CNPJOrdem                string                    `json:"cnpj_ordem"`
	CNPJDigitoVerificador    string                    `json:"cnpj_digito_verificador"`
	Tipo                     string                    `json:"tipo"`
	NomeFantasia             string                    `json:"nome_fantasia"`
	SituacaoCadastral        string                    `json:"situacao_cadastral"`
	DataSituacaoCadastral    string                    `json:"data_situacao_cadastral"`
	DataInicioAtividade      string                    `json:"data_inicio_atividade"`
	NomeCidadeExterior       *string                   `json:"nome_cidade_exterior"`
	TipoLogradouro           string                    `json:"tipo_logradouro"`
	Logradouro               string                    `json:"logradouro"`
	Numero                   string                    `json:"numero"`
	Complemento              *string                   `json:"complemento"`
	Bairro                   string                    `json:"bairro"`
	CEP                      string                    `json:"cep"`
	DDD1                     string                    `json:"ddd1"`
	Telefone1                string                    `json:"telefone1"`
	DDD2                     *string                   `json:"ddd2"`
	Telefone2                *string                   `json:"telefone2"`
	DDDFax                   *string                   `json:"ddd_fax"`
	Fax                      *string                   `json:"fax"`
	Email                    *string                   `json:"email"`
	SituacaoEspecial         *string                   `json:"situacao_especial"`
	DataSituacaoEspecial     *string                   `json:"data_situacao_especial"`
	AtualizadoEm             string                    `json:"atualizado_em"`
	AtividadePrincipal       CNPJAtividade             `json:"atividade_principal"`
	Pais                     CNPJPais                  `json:"pais"`
	Estado                   CNPJEstado                `json:"estado"`
	Cidade                   CNPJCidade                `json:"cidade"`
	MotivoSituacaoCadastral  *string                   `json:"motivo_situacao_cadastral"`
	InscricoesEstaduais      []CNPJInscricaoEstadual   `json:"inscricoes_estaduais"`
}

type CNPJAtividade struct {
	ID         string `json:"id"`
	Secao      string `json:"secao"`
	Divisao    string `json:"divisao"`
	Grupo      string `json:"grupo"`
	Classe     string `json:"classe"`
	Subclasse  string `json:"subclasse"`
	Descricao  string `json:"descricao"`
}

type CNPJPais struct {
	ID      string `json:"id"`
	ISO2    string `json:"iso2"`
	ISO3    string `json:"iso3"`
	Nome    string `json:"nome"`
	ComexID string `json:"comex_id"`
}

type CNPJEstado struct {
	ID     int    `json:"id"`
	Nome   string `json:"nome"`
	Sigla  string `json:"sigla"`
	IBGEID int    `json:"ibge_id"`
}

type CNPJCidade struct {
	ID      int    `json:"id"`
	Nome    string `json:"nome"`
	IBGEID  int    `json:"ibge_id"`
	SIAFIID string `json:"siafi_id"`
}

type CNPJInscricaoEstadual struct {
	InscricaoEstadual string     `json:"inscricao_estadual"`
	Ativo             bool       `json:"ativo"`
	AtualizadoEm      string     `json:"atualizado_em"`
	Estado            CNPJEstado `json:"estado"`
}

// Empresa unificada
type Empresa struct {
	CNPJ                string    `json:"cnpj"`
	RazaoSocial         string    `json:"razao_social"`
	NomeFantasia        string    `json:"nome_fantasia"`
	Situacao            string    `json:"situacao"`
	TipoEstabelecimento string    `json:"tipo_estabelecimento"`
	DataAbertura        string    `json:"data_abertura"`
	CNAEPrincipal       struct {
		Codigo    int    `json:"codigo"`
		Descricao string `json:"descricao"`
	} `json:"cnae_principal"`
	NaturezaJuridica    string `json:"natureza_juridica"`
	Porte               string `json:"porte"`
	CapitalSocial       int    `json:"capital_social"`
	InscricaoEstadual   string `json:"inscricao_estadual"`
	Endereco            Endereco `json:"endereco"`
	Contato          struct {
		Telefone  string `json:"telefone,omitempty"`
		Telefone2 string `json:"telefone2,omitempty"`
		Email     string `json:"email,omitempty"`
	} `json:"contato"`
	Socios []struct {
		Nome          string `json:"nome"`
		Qualificacao  string `json:"qualificacao"`
	} `json:"socios"`
	InscricoesEstaduais []InscricaoEstadual `json:"inscricoes_estaduais"`
}

// Inscrição Estadual
type InscricaoEstadual struct {
	InscricaoEstadual string `json:"inscricao_estadual"`
	Ativo             bool   `json:"ativo"`
	Estado            string `json:"estado"`
	EstadoNome        string `json:"estado_nome"`
	AtualizadoEm      string `json:"atualizado_em"`
}

// Estado
type Estado struct {
	ID     int    `json:"id"`
	Sigla  string `json:"sigla"`
	Nome   string `json:"nome"`
	Regiao struct {
		ID    int    `json:"id"`
		Sigla string `json:"sigla"`
		Nome  string `json:"nome"`
	} `json:"regiao"`
}

// Cidade
type Cidade struct {
	Nome        string `json:"nome"`
	CodigoIBGE  string `json:"codigo_ibge"`
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

type ExternalAPIService struct {
	httpClient   *http.Client
	cacheService *CacheService
}

func NewExternalAPIService(cacheService *CacheService) *ExternalAPIService {
	return &ExternalAPIService{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		cacheService: cacheService,
	}
}

// ============================================
// MÉTODOS DE CEP
// ============================================

func (s *ExternalAPIService) BuscarCEP(cep string) (*Endereco, error) {
	// Limpa e valida CEP
	cepLimpo := regexp.MustCompile(`\D`).ReplaceAllString(cep, "")
	if len(cepLimpo) != 8 {
		return nil, fmt.Errorf("CEP deve conter exatamente 8 dígitos")
	}

	// Tenta BrasilAPI primeiro
	if endereco, err := s.buscarCEPBrasilAPI(cepLimpo); err == nil {
		return endereco, nil
	}

	// Fallback para ViaCEP
	return s.buscarCEPViaCEP(cepLimpo)
}

func (s *ExternalAPIService) buscarCEPBrasilAPI(cep string) (*Endereco, error) {
	url := fmt.Sprintf("https://brasilapi.com.br/api/cep/v2/%s", cep)
	
	resp, err := s.httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("erro na API: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var cepResp CEPResponse
	if err := json.Unmarshal(body, &cepResp); err != nil {
		return nil, err
	}

	endereco := &Endereco{
		CEP:        formatarCEP(cepResp.CEP),
		Logradouro: cepResp.Street,
		Bairro:     cepResp.District,
		Cidade:     cepResp.City,
		Estado:     cepResp.State,
	}

	if cepResp.Location != nil {
		endereco.Latitude = &cepResp.Location.Coordinates.Latitude
		endereco.Longitude = &cepResp.Location.Coordinates.Longitude
	}

	return endereco, nil
}

func (s *ExternalAPIService) buscarCEPViaCEP(cep string) (*Endereco, error) {
	url := fmt.Sprintf("https://viacep.com.br/ws/%s/json/", cep)
	
	resp, err := s.httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("erro na API: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var cepResp ViaCEPResponse
	if err := json.Unmarshal(body, &cepResp); err != nil {
		return nil, err
	}

	if cepResp.Erro {
		return nil, fmt.Errorf("CEP não encontrado")
	}

	return &Endereco{
		CEP:         formatarCEP(cepResp.CEP),
		Logradouro:  cepResp.Logradouro,
		Complemento: cepResp.Complemento,
		Bairro:      cepResp.Bairro,
		Cidade:      cepResp.Localidade,
		Estado:      cepResp.UF,
		CodigoIBGE:  cepResp.IBGE,
		DDD:         cepResp.DDD,
	}, nil
}

// ============================================
// MÉTODOS DE CNPJ
// ============================================

func (s *ExternalAPIService) BuscarCNPJ(cnpj string) (*Empresa, error) {
	// Limpa e valida CNPJ
	cnpjLimpo := regexp.MustCompile(`\D`).ReplaceAllString(cnpj, "")
	if len(cnpjLimpo) != 14 {
		return nil, fmt.Errorf("CNPJ deve conter exatamente 14 dígitos")
	}

	if !validarCNPJ(cnpjLimpo) {
		return nil, fmt.Errorf("CNPJ inválido")
	}

	// URL da CNPJ.WS
	url := fmt.Sprintf("https://publica.cnpj.ws/cnpj/%s", cnpjLimpo)

	// Cliente HTTP com timeout maior para CNPJ.WS
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("erro ao consultar CNPJ: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("CNPJ não encontrado")
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("erro na API CNPJ.WS: status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("erro ao ler resposta: %v", err)
	}



	var cnpjResp CNPJResponse
	if err := json.Unmarshal(body, &cnpjResp); err != nil {
		return nil, fmt.Errorf("erro ao decodificar JSON: %v", err)
	}

	return s.transformarCNPJResponse(&cnpjResp), nil
}

// ============================================
// MÉTODOS DO IBGE
// ============================================

func (s *ExternalAPIService) BuscarEstados() ([]Estado, error) {
	// Usa o cache inteligente
	estadosCache, err := s.cacheService.GetEstados()
	if err != nil {
		return nil, err
	}

	// Converte para o formato esperado
	estados := make([]Estado, len(estadosCache))
	for i, estadoCache := range estadosCache {
		estados[i] = Estado{
			ID:     estadoCache.ID,
			Sigla:  estadoCache.Sigla,
			Nome:   estadoCache.Nome,
			Regiao: struct {
				ID    int    `json:"id"`
				Sigla string `json:"sigla"`
				Nome  string `json:"nome"`
			}{
				ID:    estadoCache.Regiao.ID,
				Sigla: estadoCache.Regiao.Sigla,
				Nome:  estadoCache.Regiao.Nome,
			},
		}
	}

	return estados, nil
}

func (s *ExternalAPIService) BuscarCidadesPorEstado(uf string) ([]Cidade, error) {
	if len(uf) != 2 {
		return nil, fmt.Errorf("UF deve conter exatamente 2 caracteres")
	}

	// Usa o cache inteligente
	cidadesCache, err := s.cacheService.GetCidadesPorEstado(strings.ToUpper(uf))
	if err != nil {
		return nil, err
	}

	// Converte para o formato esperado
	cidades := make([]Cidade, len(cidadesCache))
	for i, cidadeCache := range cidadesCache {
		cidades[i] = Cidade{
			Nome:       cidadeCache.Nome,
			CodigoIBGE: cidadeCache.CodigoIBGE,
		}
	}

	return cidades, nil
}

// ============================================
// MÉTODOS AUXILIARES
// ============================================

func (s *ExternalAPIService) transformarCNPJResponse(resp *CNPJResponse) *Empresa {
	estabelecimento := resp.Estabelecimento

	empresa := &Empresa{
		CNPJ:                formatarCNPJ(estabelecimento.CNPJ),
		RazaoSocial:         resp.RazaoSocial,
		NomeFantasia:        estabelecimento.NomeFantasia,
		Situacao:            estabelecimento.SituacaoCadastral,
		TipoEstabelecimento: estabelecimento.Tipo,
		DataAbertura:        estabelecimento.DataInicioAtividade,
		NaturezaJuridica:    resp.NaturezaJuridica.Descricao,
		Porte:               resp.Porte.Descricao,
		CapitalSocial:       0, // CNPJ.WS retorna como string, precisamos converter
	}

	// Converte capital social de string para int
	if capitalStr := resp.CapitalSocial; capitalStr != "" {
		if capital, err := strconv.ParseFloat(capitalStr, 64); err == nil {
			empresa.CapitalSocial = int(capital)
		}
	}

	// CNAE Principal
	if estabelecimento.AtividadePrincipal.ID != "" {
		if codigo, err := strconv.Atoi(estabelecimento.AtividadePrincipal.ID); err == nil {
			empresa.CNAEPrincipal.Codigo = codigo
		}
	}
	empresa.CNAEPrincipal.Descricao = estabelecimento.AtividadePrincipal.Descricao

	// Endereço
	logradouro := estabelecimento.TipoLogradouro
	if estabelecimento.Logradouro != "" {
		if logradouro != "" {
			logradouro += " " + estabelecimento.Logradouro
		} else {
			logradouro = estabelecimento.Logradouro
		}
	}

	complemento := ""
	if estabelecimento.Complemento != nil {
		complemento = *estabelecimento.Complemento
	}

	empresa.Endereco = Endereco{
		CEP:         formatarCEP(estabelecimento.CEP),
		Logradouro:  logradouro,
		Numero:      estabelecimento.Numero,
		Complemento: complemento,
		Bairro:      estabelecimento.Bairro,
		Cidade:      estabelecimento.Cidade.Nome,
		Estado:      estabelecimento.Estado.Sigla,
	}

	// Contato
	telefone := ""
	if estabelecimento.DDD1 != "" && estabelecimento.Telefone1 != "" {
		telefone = fmt.Sprintf("(%s) %s", estabelecimento.DDD1, estabelecimento.Telefone1)
	}

	telefone2 := ""
	if estabelecimento.DDD2 != nil && estabelecimento.Telefone2 != nil {
		telefone2 = fmt.Sprintf("(%s) %s", *estabelecimento.DDD2, *estabelecimento.Telefone2)
	}

	email := ""
	if estabelecimento.Email != nil {
		email = *estabelecimento.Email
	}

	empresa.Contato.Telefone = telefone
	empresa.Contato.Telefone2 = telefone2
	empresa.Contato.Email = email

	// Sócios
	for _, socio := range resp.Socios {
		empresaSocio := struct {
			Nome         string `json:"nome"`
			Qualificacao string `json:"qualificacao"`
		}{
			Nome:         socio.Nome,
			Qualificacao: socio.QualificacaoSocio.Descricao,
		}
		empresa.Socios = append(empresa.Socios, empresaSocio)
	}

	// Inscrição Estadual Principal
	if estabelecimento.InscricoesEstaduais != nil && len(estabelecimento.InscricoesEstaduais) > 0 {
		// Pega a primeira inscrição ativa ou a primeira disponível
		for _, ie := range estabelecimento.InscricoesEstaduais {
			if ie.Ativo {
				empresa.InscricaoEstadual = ie.InscricaoEstadual
				break
			}
		}
		// Se não encontrou ativa, pega a primeira
		if empresa.InscricaoEstadual == "" {
			empresa.InscricaoEstadual = estabelecimento.InscricoesEstaduais[0].InscricaoEstadual
		}
	}

	return empresa
}

// ============================================
// UTILITÁRIOS
// ============================================

func formatarCEP(cep string) string {
	if len(cep) == 8 {
		return fmt.Sprintf("%s-%s", cep[:5], cep[5:])
	}
	return cep
}

func formatarCNPJ(cnpj string) string {
	if len(cnpj) == 14 {
		return fmt.Sprintf("%s.%s.%s/%s-%s",
			cnpj[:2], cnpj[2:5], cnpj[5:8], cnpj[8:12], cnpj[12:])
	}
	return cnpj
}

func validarCNPJ(cnpj string) bool {
	if len(cnpj) != 14 {
		return false
	}

	// Elimina CNPJs conhecidos como inválidos
	if matched, _ := regexp.MatchString(`^(\d)\1{13}$`, cnpj); matched {
		return false
	}

	// Validação do primeiro dígito verificador
	soma := 0
	peso := 2
	for i := 11; i >= 0; i-- {
		digit, _ := strconv.Atoi(string(cnpj[i]))
		soma += digit * peso
		if peso == 9 {
			peso = 2
		} else {
			peso++
		}
	}

	digito1 := 0
	if resto := soma % 11; resto >= 2 {
		digito1 = 11 - resto
	}

	digit12, _ := strconv.Atoi(string(cnpj[12]))
	if digit12 != digito1 {
		return false
	}

	// Validação do segundo dígito verificador
	soma = 0
	peso = 2
	for i := 12; i >= 0; i-- {
		digit, _ := strconv.Atoi(string(cnpj[i]))
		soma += digit * peso
		if peso == 9 {
			peso = 2
		} else {
			peso++
		}
	}

	digito2 := 0
	if resto := soma % 11; resto >= 2 {
		digito2 = 11 - resto
	}

	digit13, _ := strconv.Atoi(string(cnpj[13]))
	return digit13 == digito2
}
