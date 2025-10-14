package services

import (
	"errors"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type ClienteService struct {
	db *gorm.DB
}

func NewClienteService(db *gorm.DB) *ClienteService {
	return &ClienteService{
		db: db,
	}
}

// GetAll retorna todos os clientes
func (s *ClienteService) GetAll() ([]models.Cliente, error) {
	var clientes []models.Cliente
	if err := s.db.Find(&clientes).Error; err != nil {
		return nil, err
	}
	return clientes, nil
}

// GetByID retorna um cliente por ID
func (s *ClienteService) GetByID(id uint) (*models.Cliente, error) {
	var cliente models.Cliente
	if err := s.db.Preload("CamposPersonalizados").First(&cliente, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cliente não encontrado")
		}
		return nil, err
	}
	return &cliente, nil
}

// GetByCPF busca cliente por CNPJ/CPF
func (s *ClienteService) GetByCPF(cnpjCpf string) (*models.Cliente, error) {
	var cliente models.Cliente
	if err := s.db.Where("cnpj_cpf = ?", cnpjCpf).First(&cliente).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &cliente, nil
}

// Create cria um novo cliente
func (s *ClienteService) Create(req *models.CreateClienteRequest) (*models.Cliente, error) {
	// Verifica se o CNPJ/CPF já existe
	if existingCliente, _ := s.GetByCPF(req.CNPJCPF); existingCliente != nil {
		return nil, errors.New("CNPJ/CPF já cadastrado")
	}

	cliente := &models.Cliente{
		// Identificação Fiscal
		TipoPessoa:    req.TipoPessoa,
		CNPJCPF:       req.CNPJCPF,
		IE:            req.IE,
		IM:            req.IM,
		IndIEDest:     req.IndIEDest,

		// Dados Cadastrais
		RazaoSocial:   req.RazaoSocial,
		NomeFantasia:  req.NomeFantasia,

		// Classificação
		ConsumidorFinal: req.ConsumidorFinal,
		TipoContato:     req.TipoContato,
		Status:          req.Status,

		// Contatos
		Email:           req.Email,
		Fone:            req.Fone,
		Celular:         req.Celular,
		PontoReferencia: req.PontoReferencia,

		// Endereço Principal
		Logradouro:  req.Logradouro,
		Numero:      req.Numero,
		Complemento: req.Complemento,
		Bairro:      req.Bairro,
		CodigoIBGE:  req.CodigoIBGE,
		Municipio:   req.Municipio,
		UF:          req.UF,
		CEP:         req.CEP,
		CodigoPais:  req.CodigoPais,
		Pais:        req.Pais,

		// Endereço de Entrega
		LogradouroEntrega:  req.LogradouroEntrega,
		NumeroEntrega:      req.NumeroEntrega,
		ComplementoEntrega: req.ComplementoEntrega,
		BairroEntrega:      req.BairroEntrega,
		CodigoIBGEEntrega:  req.CodigoIBGEEntrega,
		MunicipioEntrega:   req.MunicipioEntrega,
		UFEntrega:          req.UFEntrega,
		CEPEntrega:         req.CEPEntrega,
		CodigoPaisEntrega:  req.CodigoPaisEntrega,
		PaisEntrega:        req.PaisEntrega,

		// Dados Financeiros
		LimiteCredito:  req.LimiteCredito,
		SaldoInicial:   req.SaldoInicial,
		PrazoPagamento: req.PrazoPagamento,
	}

	// Processar datas se fornecidas
	if req.DataNascimento != "" {
		// TODO: Converter string para time.Time
	}
	if req.DataAbertura != "" {
		// TODO: Converter string para time.Time
	}

	if err := s.db.Create(cliente).Error; err != nil {
		return nil, err
	}

	// Processar campos personalizados se fornecidos
	if len(req.CamposPersonalizados) > 0 {
		for _, campo := range req.CamposPersonalizados {
			campoPersonalizado := &models.ClienteCampoPersonalizado{
				ClienteID: cliente.ID,
				Nome:      campo.Nome,
				Valor:     campo.Valor,
				Ordem:     campo.Ordem,
			}
			if err := s.db.Create(campoPersonalizado).Error; err != nil {
				return nil, err
			}
		}
	}

	return cliente, nil
}

// Update atualiza um cliente
func (s *ClienteService) Update(id uint, req *models.UpdateClienteRequest) (*models.Cliente, error) {
	cliente, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Atualiza os campos fornecidos (apenas se não forem nil)
	if req.TipoPessoa != nil {
		cliente.TipoPessoa = *req.TipoPessoa
	}
	if req.CNPJCPF != nil {
		cliente.CNPJCPF = *req.CNPJCPF
	}
	if req.IE != nil {
		cliente.IE = *req.IE
	}
	if req.IM != nil {
		cliente.IM = *req.IM
	}
	if req.IndIEDest != nil {
		cliente.IndIEDest = *req.IndIEDest
	}
	if req.RazaoSocial != nil {
		cliente.RazaoSocial = *req.RazaoSocial
	}
	if req.NomeFantasia != nil {
		cliente.NomeFantasia = *req.NomeFantasia
	}
	if req.ConsumidorFinal != nil {
		cliente.ConsumidorFinal = *req.ConsumidorFinal
	}
	if req.TipoContato != nil {
		cliente.TipoContato = *req.TipoContato
	}
	if req.Status != nil {
		cliente.Status = *req.Status
	}
	if req.Email != nil {
		cliente.Email = *req.Email
	}
	if req.Fone != nil {
		cliente.Fone = *req.Fone
	}
	if req.Celular != nil {
		cliente.Celular = *req.Celular
	}
	if req.PontoReferencia != nil {
		cliente.PontoReferencia = *req.PontoReferencia
	}
	if req.Logradouro != nil {
		cliente.Logradouro = *req.Logradouro
	}
	if req.Numero != nil {
		cliente.Numero = *req.Numero
	}
	if req.Complemento != nil {
		cliente.Complemento = *req.Complemento
	}
	if req.Bairro != nil {
		cliente.Bairro = *req.Bairro
	}
	if req.CodigoIBGE != nil {
		cliente.CodigoIBGE = *req.CodigoIBGE
	}
	if req.Municipio != nil {
		cliente.Municipio = *req.Municipio
	}
	if req.UF != nil {
		cliente.UF = *req.UF
	}
	if req.CEP != nil {
		cliente.CEP = *req.CEP
	}
	if req.LimiteCredito != nil {
		cliente.LimiteCredito = *req.LimiteCredito
	}
	if req.SaldoInicial != nil {
		cliente.SaldoInicial = *req.SaldoInicial
	}
	if req.PrazoPagamento != nil {
		cliente.PrazoPagamento = *req.PrazoPagamento
	}

	if err := s.db.Save(cliente).Error; err != nil {
		return nil, err
	}

	// Atualizar campos personalizados se fornecidos
	if req.CamposPersonalizados != nil {
		// Remove campos antigos
		if err := s.db.Where("cliente_id = ?", cliente.ID).Delete(&models.ClienteCampoPersonalizado{}).Error; err != nil {
			return nil, err
		}

		// Adiciona novos campos
		for _, campo := range req.CamposPersonalizados {
			campoPersonalizado := &models.ClienteCampoPersonalizado{
				ClienteID: cliente.ID,
				Nome:      campo.Nome,
				Valor:     campo.Valor,
				Ordem:     campo.Ordem,
			}
			if err := s.db.Create(campoPersonalizado).Error; err != nil {
				return nil, err
			}
		}
	}

	return cliente, nil
}

// Delete remove um cliente (soft delete)
func (s *ClienteService) Delete(id uint) error {
	return s.db.Delete(&models.Cliente{}, id).Error
}

// GetByStatus retorna clientes por status
func (s *ClienteService) GetByStatus(status string) ([]models.Cliente, error) {
	var clientes []models.Cliente
	if err := s.db.Where("status = ?", status).Order("created_at DESC").Find(&clientes).Error; err != nil {
		return nil, err
	}
	return clientes, nil
}

// Search busca clientes por nome, email ou CNPJ/CPF
func (s *ClienteService) Search(query string) ([]models.Cliente, error) {
	var clientes []models.Cliente
	searchPattern := "%" + query + "%"

	if err := s.db.Where("razao_social ILIKE ? OR email ILIKE ? OR cnpj_cpf ILIKE ?",
		searchPattern, searchPattern, searchPattern).
		Order("created_at DESC").
		Find(&clientes).Error; err != nil {
		return nil, err
	}
	return clientes, nil
}

// GetStats retorna estatísticas dos clientes
func (s *ClienteService) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total de clientes
	var total int64
	s.db.Model(&models.Cliente{}).Count(&total)
	stats["total"] = total

	// Clientes ativos
	var ativos int64
	s.db.Model(&models.Cliente{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos

	// Clientes inativos
	var inativos int64
	s.db.Model(&models.Cliente{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos

	// Por tipo de contato
	type TipoStat struct {
		TipoContato string
		Count       int64
	}
	var tipoStats []TipoStat
	s.db.Model(&models.Cliente{}).Select("tipo_contato, count(*) as count").Group("tipo_contato").Scan(&tipoStats)

	tipoMap := make(map[string]int64)
	for _, stat := range tipoStats {
		tipoMap[stat.TipoContato] = stat.Count
	}
	stats["porTipo"] = tipoMap

	return stats, nil
}
