package services

import (
	"errors"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type FornecedorService struct {
	db *gorm.DB
}

func NewFornecedorService(db *gorm.DB) *FornecedorService {
	return &FornecedorService{
		db: db,
	}
}

// GetAll retorna todos os fornecedores
func (s *FornecedorService) GetAll() ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	if err := s.db.Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	return fornecedores, nil
}

// GetByID retorna um fornecedor por ID
func (s *FornecedorService) GetByID(id uint) (*models.Fornecedor, error) {
	var fornecedor models.Fornecedor
	if err := s.db.Preload("CamposPersonalizados").First(&fornecedor, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("fornecedor não encontrado")
		}
		return nil, err
	}
	return &fornecedor, nil
}

// GetByCNPJCPF busca fornecedor por CNPJ/CPF
func (s *FornecedorService) GetByCNPJCPF(cnpjCpf string) (*models.Fornecedor, error) {
	var fornecedor models.Fornecedor
	if err := s.db.Where("cnpj_cpf = ?", cnpjCpf).First(&fornecedor).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &fornecedor, nil
}

// Create cria um novo fornecedor
func (s *FornecedorService) Create(req *models.CreateFornecedorRequest) (*models.Fornecedor, error) {
	// Verifica se o CNPJ/CPF já existe
	if existingFornecedor, _ := s.GetByCNPJCPF(req.CNPJCPF); existingFornecedor != nil {
		return nil, errors.New("CNPJ/CPF já cadastrado")
	}

	fornecedor := &models.Fornecedor{
		// Identificação Fiscal
		TipoPessoa: req.TipoPessoa,
		CNPJCPF:    req.CNPJCPF,
		IE:         req.IE,
		IM:         req.IM,
		IndIEDest:  req.IndIEDest,

		// Dados Cadastrais
		RazaoSocial:  req.RazaoSocial,
		NomeFantasia: req.NomeFantasia,

		// Classificação
		Categoria: req.Categoria,
		Status:    req.Status,

		// Contatos
		Email:           req.Email,
		Fone:            req.Fone,
		Celular:         req.Celular,
		Site:            req.Site,
		PontoReferencia: req.PontoReferencia,

		// Contato Principal
		NomeContato:     req.NomeContato,
		CargoContato:    req.CargoContato,
		TelefoneContato: req.TelefoneContato,
		EmailContato:    req.EmailContato,

		// Endereço Principal
		Logradouro: req.Logradouro,
		Numero:     req.Numero,
		Complemento: req.Complemento,
		Bairro:     req.Bairro,
		CodigoIBGE: req.CodigoIBGE,
		Municipio:  req.Municipio,
		UF:         req.UF,
		CEP:        req.CEP,
		CodigoPais: req.CodigoPais,
		Pais:       req.Pais,

		// Dados Comerciais
		PrazoPagamento:    req.PrazoPagamento,
		LimiteCompra:      req.LimiteCompra,
		DescontoNegociado: req.DescontoNegociado,
		FreteMinimo:       req.FreteMinimo,
		PedidoMinimo:      req.PedidoMinimo,
		PrazoEntrega:      req.PrazoEntrega,

		// Dados Bancários
		Banco:     req.Banco,
		Agencia:   req.Agencia,
		Conta:     req.Conta,
		TipoConta: req.TipoConta,
		PIX:       req.PIX,

		// Observações
		Observacoes: req.Observacoes,
		Anotacoes:   req.Anotacoes,
	}

	if err := s.db.Create(fornecedor).Error; err != nil {
		return nil, err
	}

	// Processar campos personalizados se fornecidos
	if len(req.CamposPersonalizados) > 0 {
		for _, campo := range req.CamposPersonalizados {
			campoPersonalizado := &models.FornecedorCampoPersonalizado{
				FornecedorID: fornecedor.ID,
				Nome:         campo.Nome,
				Valor:        campo.Valor,
				Ordem:        campo.Ordem,
			}
			if err := s.db.Create(campoPersonalizado).Error; err != nil {
				return nil, err
			}
		}
	}

	return fornecedor, nil
}

// Update atualiza um fornecedor
func (s *FornecedorService) Update(id uint, req *models.UpdateFornecedorRequest) (*models.Fornecedor, error) {
	fornecedor, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Atualiza os campos fornecidos (apenas se não forem nil)
	if req.TipoPessoa != nil {
		fornecedor.TipoPessoa = *req.TipoPessoa
	}
	if req.CNPJCPF != nil {
		fornecedor.CNPJCPF = *req.CNPJCPF
	}
	if req.IE != nil {
		fornecedor.IE = *req.IE
	}
	if req.IM != nil {
		fornecedor.IM = *req.IM
	}
	if req.RazaoSocial != nil {
		fornecedor.RazaoSocial = *req.RazaoSocial
	}
	if req.NomeFantasia != nil {
		fornecedor.NomeFantasia = *req.NomeFantasia
	}
	if req.Categoria != nil {
		fornecedor.Categoria = *req.Categoria
	}
	if req.Status != nil {
		fornecedor.Status = *req.Status
	}
	if req.Email != nil {
		fornecedor.Email = *req.Email
	}
	if req.Fone != nil {
		fornecedor.Fone = *req.Fone
	}
	if req.Celular != nil {
		fornecedor.Celular = *req.Celular
	}

	if err := s.db.Save(fornecedor).Error; err != nil {
		return nil, err
	}

	return fornecedor, nil
}

// Delete remove um fornecedor (soft delete)
func (s *FornecedorService) Delete(id uint) error {
	return s.db.Delete(&models.Fornecedor{}, id).Error
}

// GetByStatus retorna fornecedores por status
func (s *FornecedorService) GetByStatus(status string) ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	if err := s.db.Where("status = ?", status).Order("created_at DESC").Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	return fornecedores, nil
}

// GetByCategoria retorna fornecedores por categoria
func (s *FornecedorService) GetByCategoria(categoria string) ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	if err := s.db.Where("categoria = ?", categoria).Order("created_at DESC").Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	return fornecedores, nil
}

// Search busca fornecedores por razão social, nome fantasia ou CNPJ/CPF
func (s *FornecedorService) Search(query string) ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	searchPattern := "%" + query + "%"

	if err := s.db.Where("razao_social ILIKE ? OR nome_fantasia ILIKE ? OR cnpj_cpf ILIKE ?",
		searchPattern, searchPattern, searchPattern).
		Order("created_at DESC").
		Find(&fornecedores).Error; err != nil {
		return nil, err
	}
	return fornecedores, nil
}

// GetStats retorna estatísticas dos fornecedores
func (s *FornecedorService) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total de fornecedores
	var total int64
	s.db.Model(&models.Fornecedor{}).Count(&total)
	stats["total"] = total

	// Fornecedores ativos
	var ativos int64
	s.db.Model(&models.Fornecedor{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos

	// Fornecedores inativos
	var inativos int64
	s.db.Model(&models.Fornecedor{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos

	// Por categoria
	type CategoriaStat struct {
		Categoria string
		Count     int64
	}
	var categoriaStats []CategoriaStat
	s.db.Model(&models.Fornecedor{}).Select("categoria, count(*) as count").Group("categoria").Scan(&categoriaStats)

	categoriaMap := make(map[string]int64)
	for _, stat := range categoriaStats {
		categoriaMap[stat.Categoria] = stat.Count
	}
	stats["porCategoria"] = categoriaMap

	return stats, nil
}
