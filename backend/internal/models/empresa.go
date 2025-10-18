package models

import (
	"time"
	"gorm.io/gorm"
)

// Empresa representa os dados fiscais da empresa emitente
type Empresa struct {
	ID                    uint           `gorm:"primaryKey;column:id" json:"id"`
	RazaoSocial           string         `gorm:"size:200;not null;column:razao_social" json:"razao_social"`
	NomeFantasia          string         `gorm:"size:200;column:nome_fantasia" json:"nome_fantasia"`
	CNPJ                  string         `gorm:"size:18;uniqueIndex;not null;column:cnpj" json:"cnpj"`
	InscricaoEstadual     string         `gorm:"size:20;column:inscricao_estadual" json:"inscricao_estadual"`
	InscricaoMunicipal    string         `gorm:"size:20;column:inscricao_municipal" json:"inscricao_municipal"`
	CNAE                  string         `gorm:"size:10;column:cnae" json:"cnae"`
	
	// Endereço
	Logradouro            string         `gorm:"size:200;not null;column:logradouro" json:"logradouro"`
	Numero                string         `gorm:"size:20;not null;column:numero" json:"numero"`
	Complemento           string         `gorm:"size:100;column:complemento" json:"complemento"`
	Bairro                string         `gorm:"size:100;not null;column:bairro" json:"bairro"`
	CEP                   string         `gorm:"size:10;not null;column:cep" json:"cep"`
	CidadeID              uint           `gorm:"not null;index;column:cidade_id" json:"cidade_id"`
	UF                    string         `gorm:"size:2;not null;column:uf" json:"uf"`
	
	// Contato
	Telefone              string         `gorm:"size:20;column:telefone" json:"telefone"`
	Email                 string         `gorm:"size:200;column:email" json:"email"`
	Site                  string         `gorm:"size:200;column:site" json:"site"`
	
	// Regime Tributário
	RegimeTributario      string         `gorm:"size:50;not null;default:'SIMPLES_NACIONAL';column:regime_tributario" json:"regime_tributario"` // SIMPLES_NACIONAL, LUCRO_PRESUMIDO, LUCRO_REAL
	CRT                   int            `gorm:"not null;default:1;column:crt" json:"crt"` // 1=Simples Nacional, 2=Simples Nacional - excesso, 3=Regime Normal
	
	// Configurações Fiscais
	CertificadoA1         string         `gorm:"type:text;column:certificado_a1" json:"-"` // Base64 encoded, não retorna no JSON
	SenhaCertificado      string         `gorm:"type:text;column:senha_certificado" json:"-"` // Criptografada, não retorna no JSON
	TipoCertificado       string         `gorm:"size:2;default:'A1';column:tipo_certificado" json:"tipo_certificado"` // A1, A3
	ValidadeCertificado   *time.Time     `gorm:"column:validade_certificado" json:"validade_certificado"`
	
	// Configurações NFe/NFCe
	AmbienteNFe           int            `gorm:"default:2;column:ambiente_nfe" json:"ambiente_nfe"` // 1=Produção, 2=Homologação
	SerieNFe              int            `gorm:"default:1;column:serie_nfe" json:"serie_nfe"`
	SerieNFCe             int            `gorm:"default:1;column:serie_nfce" json:"serie_nfce"`
	NumeroAtualNFe        int            `gorm:"default:0;column:numero_atual_nfe" json:"numero_atual_nfe"`
	NumeroAtualNFCe       int            `gorm:"default:0;column:numero_atual_nfce" json:"numero_atual_nfce"`
	
	// Configurações de Emissão
	FormatoImpressao      int            `gorm:"default:1;column:formato_impressao" json:"formato_impressao"` // 1=Retrato, 2=Paisagem
	FormaEmissao          int            `gorm:"default:1;column:forma_emissao" json:"forma_emissao"` // 1=Normal, 2=Contingência
	FinalidadeEmissao     int            `gorm:"default:1;column:finalidade_emissao" json:"finalidade_emissao"` // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
	ProcessoEmissao       int            `gorm:"default:0;column:processo_emissao" json:"processo_emissao"` // 0=Aplicativo do contribuinte
	VersaoProcesso        string         `gorm:"size:20;default:'1.0.0';column:versao_processo" json:"versao_processo"`
	
	// Configurações de Arquivo
	SalvarXML             bool           `gorm:"default:true;column:salvar_xml" json:"salvar_xml"`
	PastaXMLEnviado       string         `gorm:"size:500;column:pasta_xml_enviado" json:"pasta_xml_enviado"`
	PastaXMLRetorno       string         `gorm:"size:500;column:pasta_xml_retorno" json:"pasta_xml_retorno"`
	
	// Configurações de Email
	EnviarEmail           bool           `gorm:"default:false;column:enviar_email" json:"enviar_email"`
	EmailCopia            string         `gorm:"size:200;column:email_copia" json:"email_copia"`
	
	// Logomarca
	Logomarca             string         `gorm:"type:text;column:logomarca" json:"logomarca"` // Base64 encoded
	
	// Controle
	Ativo                 bool           `gorm:"default:true;column:ativo" json:"ativo"`
	CreatedAt             time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt             time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
	
	// Relacionamentos
	Cidade                *Cidade        `gorm:"foreignKey:CidadeID" json:"cidade,omitempty"`
}

func (Empresa) TableName() string {
	return "empresas"
}

// GetCodigoUF retorna o código da UF para SEFAZ
func (e *Empresa) GetCodigoUF() string {
	estados := map[string]string{
		"RO": "11", "AC": "12", "AM": "13", "RR": "14",
		"PA": "15", "AP": "16", "TO": "17", "MA": "21",
		"PI": "22", "CE": "23", "RN": "24", "PB": "25",
		"PE": "26", "AL": "27", "SE": "28", "BA": "29",
		"MG": "31", "ES": "32", "RJ": "33", "SP": "35",
		"PR": "41", "SC": "42", "RS": "43", "MS": "50",
		"MT": "51", "GO": "52", "DF": "53",
	}
	return estados[e.UF]
}

// GetProximoNumeroNFe retorna e incrementa o próximo número de NFe
func (e *Empresa) GetProximoNumeroNFe(db *gorm.DB) int {
	e.NumeroAtualNFe++
	db.Model(e).Update("numero_atual_nfe", e.NumeroAtualNFe)
	return e.NumeroAtualNFe
}

// GetProximoNumeroNFCe retorna e incrementa o próximo número de NFCe
func (e *Empresa) GetProximoNumeroNFCe(db *gorm.DB) int {
	e.NumeroAtualNFCe++
	db.Model(e).Update("numero_atual_nfce", e.NumeroAtualNFCe)
	return e.NumeroAtualNFCe
}

// IsProducao verifica se está em ambiente de produção
func (e *Empresa) IsProducao() bool {
	return e.AmbienteNFe == 1
}

// GetURLWebservice retorna a URL do webservice SEFAZ para a UF
func (e *Empresa) GetURLWebservice(tipoDocumento string) string {
	// URLs base dos webservices por UF (exemplo para SP)
	// Em produção, isso deveria vir de uma tabela de configuração
	baseURLs := map[string]map[string]string{
		"SP": {
			"nfe_prod":  "https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
			"nfe_homol": "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
			"nfce_prod": "https://nfce.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
			"nfce_homol": "https://homologacao.nfce.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
		},
		// Adicionar outras UFs conforme necessário
	}
	
	ambiente := "homol"
	if e.IsProducao() {
		ambiente = "prod"
	}
	
	key := tipoDocumento + "_" + ambiente
	if urls, exists := baseURLs[e.UF]; exists {
		if url, exists := urls[key]; exists {
			return url
		}
	}
	
	// URL padrão se não encontrar específica
	return ""
}

// Requests para API
type CreateEmpresaRequest struct {
	RazaoSocial        string `json:"razao_social" binding:"required,max=200"`
	NomeFantasia       string `json:"nome_fantasia" binding:"max=200"`
	CNPJ               string `json:"cnpj" binding:"required,len=14"`
	InscricaoEstadual  string `json:"inscricao_estadual" binding:"max=20"`
	InscricaoMunicipal string `json:"inscricao_municipal" binding:"max=20"`
	CNAE               string `json:"cnae" binding:"max=10"`
	Logradouro         string `json:"logradouro" binding:"required,max=200"`
	Numero             string `json:"numero" binding:"required,max=20"`
	Complemento        string `json:"complemento" binding:"max=100"`
	Bairro             string `json:"bairro" binding:"required,max=100"`
	CEP                string `json:"cep" binding:"required,len=8"`
	CidadeID           uint   `json:"cidade_id" binding:"required"`
	UF                 string `json:"uf" binding:"required,len=2"`
	Telefone           string `json:"telefone" binding:"max=20"`
	Email              string `json:"email" binding:"email,max=200"`
	Site               string `json:"site" binding:"max=200"`
	RegimeTributario   string `json:"regime_tributario" binding:"required,oneof=SIMPLES_NACIONAL LUCRO_PRESUMIDO LUCRO_REAL"`
	CRT                int    `json:"crt" binding:"required,min=1,max=3"`
}

type UpdateEmpresaRequest struct {
	RazaoSocial        *string `json:"razao_social" binding:"omitempty,max=200"`
	NomeFantasia       *string `json:"nome_fantasia" binding:"omitempty,max=200"`
	CNPJ               *string `json:"cnpj" binding:"omitempty,len=14"`
	InscricaoEstadual  *string `json:"inscricao_estadual" binding:"omitempty,max=20"`
	InscricaoMunicipal *string `json:"inscricao_municipal" binding:"omitempty,max=20"`
	CNAE               *string `json:"cnae" binding:"omitempty,max=10"`
	Logradouro         *string `json:"logradouro" binding:"omitempty,max=200"`
	Numero             *string `json:"numero" binding:"omitempty,max=20"`
	Complemento        *string `json:"complemento" binding:"omitempty,max=100"`
	Bairro             *string `json:"bairro" binding:"omitempty,max=100"`
	CEP                *string `json:"cep" binding:"omitempty,len=8"`
	CidadeID           *uint   `json:"cidade_id"`
	UF                 *string `json:"uf" binding:"omitempty,len=2"`
	Telefone           *string `json:"telefone" binding:"omitempty,max=20"`
	Email              *string `json:"email" binding:"omitempty,email,max=200"`
	Site               *string `json:"site" binding:"omitempty,max=200"`
	RegimeTributario   *string `json:"regime_tributario" binding:"omitempty,oneof=SIMPLES_NACIONAL LUCRO_PRESUMIDO LUCRO_REAL"`
	CRT                *int    `json:"crt" binding:"omitempty,min=1,max=3"`
}

type UpdateCertificadoRequest struct {
	CertificadoA1       string     `json:"certificado_a1" binding:"required"` // Base64
	SenhaCertificado    string     `json:"senha_certificado" binding:"required"`
	TipoCertificado     string     `json:"tipo_certificado" binding:"required,oneof=A1 A3"`
	ValidadeCertificado *time.Time `json:"validade_certificado"`
}

type UpdateConfiguracaoFiscalRequest struct {
	AmbienteNFe       *int    `json:"ambiente_nfe" binding:"omitempty,min=1,max=2"`
	SerieNFe          *int    `json:"serie_nfe" binding:"omitempty,min=1"`
	SerieNFCe         *int    `json:"serie_nfce" binding:"omitempty,min=1"`
	FormatoImpressao  *int    `json:"formato_impressao" binding:"omitempty,min=1,max=2"`
	FormaEmissao      *int    `json:"forma_emissao" binding:"omitempty,min=1"`
	FinalidadeEmissao *int    `json:"finalidade_emissao" binding:"omitempty,min=1,max=4"`
	ProcessoEmissao   *int    `json:"processo_emissao" binding:"omitempty,min=0"`
	VersaoProcesso    *string `json:"versao_processo" binding:"omitempty,max=20"`
	SalvarXML         *bool   `json:"salvar_xml"`
	PastaXMLEnviado   *string `json:"pasta_xml_enviado" binding:"omitempty,max=500"`
	PastaXMLRetorno   *string `json:"pasta_xml_retorno" binding:"omitempty,max=500"`
	EnviarEmail       *bool   `json:"enviar_email"`
	EmailCopia        *string `json:"email_copia" binding:"omitempty,email,max=200"`
}
