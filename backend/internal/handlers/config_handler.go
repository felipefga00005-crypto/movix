package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type ConfigHandler struct {
	db *gorm.DB
}

func NewConfigHandler(db *gorm.DB) *ConfigHandler {
	return &ConfigHandler{
		db: db,
	}
}

// ============================================
// CONFIGURAÇÕES DA EMPRESA
// ============================================

// GetEmpresa retorna dados da empresa
func (h *ConfigHandler) GetEmpresa(c *gin.Context) {
	var empresa models.Empresa
	if err := h.db.First(&empresa).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Empresa não configurada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Não retornar dados sensíveis como certificado e senha
	response := gin.H{
		"id":                   empresa.ID,
		"razao_social":         empresa.RazaoSocial,
		"nome_fantasia":        empresa.NomeFantasia,
		"cnpj":                 empresa.CNPJ,
		"inscricao_estadual":   empresa.InscricaoEstadual,
		"inscricao_municipal":  empresa.InscricaoMunicipal,
		"logradouro":           empresa.Logradouro,
		"numero":               empresa.Numero,
		"complemento":          empresa.Complemento,
		"bairro":               empresa.Bairro,
		"cep":                  empresa.CEP,
		"uf":                   empresa.UF,
		"cidade_id":            empresa.CidadeID,
		"telefone":             empresa.Telefone,
		"email":                empresa.Email,
		"crt":                  empresa.CRT,
		"ambiente_nfe":         empresa.AmbienteNFe,
		"serie_nfe":            empresa.SerieNFe,
		"serie_nfce":           empresa.SerieNFCe,
		"ativo":                empresa.Ativo,
		"tem_certificado":      empresa.CertificadoA1 != "",
		"created_at":           empresa.CreatedAt,
		"updated_at":           empresa.UpdatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// CreateEmpresa cria configuração da empresa
func (h *ConfigHandler) CreateEmpresa(c *gin.Context) {
	var request models.Empresa
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar se já existe uma empresa
	var count int64
	h.db.Model(&models.Empresa{}).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Empresa já configurada. Use PUT para atualizar."})
		return
	}

	// Definir como ativa por padrão
	request.Ativo = true

	if err := h.db.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":      request.ID,
		"message": "Empresa criada com sucesso",
	})
}

// UpdateEmpresa atualiza configuração da empresa
func (h *ConfigHandler) UpdateEmpresa(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var empresa models.Empresa
	if err := h.db.First(&empresa, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa não encontrada"})
		return
	}

	var request models.Empresa
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Manter ID e timestamps
	request.ID = empresa.ID
	request.CreatedAt = empresa.CreatedAt

	if err := h.db.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Empresa atualizada com sucesso",
	})
}

// ============================================
// CERTIFICADO DIGITAL
// ============================================

// UploadCertificado faz upload do certificado digital
func (h *ConfigHandler) UploadCertificado(c *gin.Context) {
	var request struct {
		CertificadoBase64 string `json:"certificado_base64" binding:"required"`
		Senha             string `json:"senha" binding:"required"`
		EmpresaID         uint   `json:"empresa_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar empresa
	var empresa models.Empresa
	if err := h.db.First(&empresa, request.EmpresaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa não encontrada"})
		return
	}

	// TODO: Validar certificado antes de salvar
	// Por enquanto, apenas salva os dados

	// Atualizar empresa com certificado
	empresa.CertificadoA1 = request.CertificadoBase64
	empresa.SenhaCertificado = request.Senha

	if err := h.db.Save(&empresa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Certificado salvo com sucesso",
	})
}

// ValidarCertificado valida o certificado atual
func (h *ConfigHandler) ValidarCertificado(c *gin.Context) {
	empresaIDStr := c.Param("empresa_id")
	empresaID, err := strconv.ParseUint(empresaIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da empresa inválido"})
		return
	}

	var empresa models.Empresa
	if err := h.db.First(&empresa, uint(empresaID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa não encontrada"})
		return
	}

	if empresa.CertificadoA1 == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Certificado não configurado"})
		return
	}

	// TODO: Implementar validação real do certificado
	// Por enquanto, simula validação
	c.JSON(http.StatusOK, gin.H{
		"valido":        true,
		"subject":       "CN=EMPRESA TESTE LTDA",
		"issuer":        "CN=AC CERTISIGN RFB G5",
		"valido_ate":    "2025-12-31T23:59:59Z",
		"tem_chave_privada": true,
	})
}

// ============================================
// NATUREZAS DE OPERAÇÃO
// ============================================

// GetNaturezasOperacao lista naturezas de operação
func (h *ConfigHandler) GetNaturezasOperacao(c *gin.Context) {
	var naturezas []models.NaturezaOperacao
	if err := h.db.Find(&naturezas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  naturezas,
		"total": len(naturezas),
	})
}

// CreateNaturezaOperacao cria uma natureza de operação
func (h *ConfigHandler) CreateNaturezaOperacao(c *gin.Context) {
	var request models.NaturezaOperacao
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, request)
}

// UpdateNaturezaOperacao atualiza uma natureza de operação
func (h *ConfigHandler) UpdateNaturezaOperacao(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var natureza models.NaturezaOperacao
	if err := h.db.First(&natureza, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Natureza de operação não encontrada"})
		return
	}

	var request models.NaturezaOperacao
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Manter ID e timestamps
	request.ID = natureza.ID
	request.CreatedAt = natureza.CreatedAt

	if err := h.db.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, request)
}

// DeleteNaturezaOperacao remove uma natureza de operação
func (h *ConfigHandler) DeleteNaturezaOperacao(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.db.Delete(&models.NaturezaOperacao{}, uint(id)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Natureza de operação removida com sucesso",
	})
}

// ============================================
// CONFIGURAÇÕES GERAIS
// ============================================

// GetConfiguracoes retorna configurações gerais do sistema
func (h *ConfigHandler) GetConfiguracoes(c *gin.Context) {
	// TODO: Implementar configurações gerais
	configs := gin.H{
		"sistema": gin.H{
			"nome":    "Movix PDV",
			"versao":  "1.0.0",
			"ambiente": "desenvolvimento",
		},
		"fiscal": gin.H{
			"servico_ativo":     true,
			"url_servico":       "http://localhost:8081",
			"timeout_segundos":  60,
			"retry_tentativas":  3,
		},
		"impressao": gin.H{
			"impressora_padrao": "Térmica 80mm",
			"copias_danfe":      1,
			"margem_mm":         5,
		},
	}

	c.JSON(http.StatusOK, configs)
}

// UpdateConfiguracoes atualiza configurações gerais
func (h *ConfigHandler) UpdateConfiguracoes(c *gin.Context) {
	var request map[string]interface{}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implementar salvamento de configurações
	c.JSON(http.StatusOK, gin.H{
		"message": "Configurações atualizadas com sucesso",
		"data":    request,
	})
}

// ============================================
// UTILITÁRIOS
// ============================================

// TestarConexaoSEFAZ testa conexão com webservices SEFAZ
func (h *ConfigHandler) TestarConexaoSEFAZ(c *gin.Context) {
	uf := c.DefaultQuery("uf", "SP")
	ambiente := c.DefaultQuery("ambiente", "2") // 2 = Homologação

	// TODO: Implementar teste real de conexão
	c.JSON(http.StatusOK, gin.H{
		"sucesso":   true,
		"uf":        uf,
		"ambiente":  ambiente,
		"tempo_ms":  150,
		"status":    "Webservice SEFAZ disponível",
		"url_teste": "https://homologacao.nfce.fazenda.sp.gov.br/ws/nfceautorizacao.asmx",
	})
}

// GetEstados retorna lista de estados brasileiros
func (h *ConfigHandler) GetEstados(c *gin.Context) {
	var estados []models.Estado
	if err := h.db.Find(&estados).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": estados,
	})
}

// GetCidades retorna cidades de um estado
func (h *ConfigHandler) GetCidades(c *gin.Context) {
	uf := c.Param("uf")
	if uf == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "UF é obrigatória"})
		return
	}

	var cidades []models.Cidade
	if err := h.db.Where("uf = ?", uf).Find(&cidades).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": cidades,
		"uf":   uf,
	})
}
