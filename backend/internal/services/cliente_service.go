package services

import (
	"errors"

	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type ClienteService struct {
	db *gorm.DB
}

func NewClienteService() *ClienteService {
	return &ClienteService{
		db: database.GetDB(),
	}
}

func (s *ClienteService) GetAll() ([]models.Cliente, error) {
	var clientes []models.Cliente
	
	if err := s.db.Order(`"dataCadastro" DESC`).Find(&clientes).Error; err != nil {
		return nil, err
	}
	
	return clientes, nil
}

func (s *ClienteService) GetByID(id uint) (*models.Cliente, error) {
	var cliente models.Cliente
	
	if err := s.db.First(&cliente, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cliente não encontrado")
		}
		return nil, err
	}
	
	return &cliente, nil
}

func (s *ClienteService) Create(req *models.CreateClienteRequest) (*models.Cliente, error) {
	// Verifica se o CPF já existe
	var existingCliente models.Cliente
	if err := s.db.Where("cpf = ?", req.CPF).First(&existingCliente).Error; err == nil {
		return nil, errors.New("CPF já cadastrado")
	}
	
	cliente := &models.Cliente{
		// Dados Básicos
		CPF:                   req.CPF,
		IeRg:                  req.IeRg,
		InscricaoMunicipal:    req.InscricaoMunicipal,
		Nome:                  req.Nome,
		NomeFantasia:          req.NomeFantasia,
		TipoContato:           req.TipoContato,
		ConsumidorFinal:       req.ConsumidorFinal,

		// Contatos
		Email:                 req.Email,
		PontoReferencia:       req.PontoReferencia,
		TelefoneFixo:          req.TelefoneFixo,
		TelefoneAlternativo:   req.TelefoneAlternativo,
		Celular:               req.Celular,

		// Endereço Principal
		CEP:                   req.CEP,
		Endereco:              req.Endereco,
		Numero:                req.Numero,
		Complemento:           req.Complemento,
		Bairro:                req.Bairro,
		Cidade:                req.Cidade,
		Estado:                req.Estado,
		CodigoIbge:            req.CodigoIbge,

		// Endereço de Entrega
		CEPEntrega:            req.CEPEntrega,
		EnderecoEntrega:       req.EnderecoEntrega,
		NumeroEntrega:         req.NumeroEntrega,
		ComplementoEntrega:    req.ComplementoEntrega,
		BairroEntrega:         req.BairroEntrega,
		CidadeEntrega:         req.CidadeEntrega,
		EstadoEntrega:         req.EstadoEntrega,

		// Dados Financeiros
		LimiteCredito:         req.LimiteCredito,
		SaldoInicial:          req.SaldoInicial,
		PrazoPagamento:        req.PrazoPagamento,
		// Campos de Sistema
		DataNascimento:        req.DataNascimento,
		DataAbertura:          req.DataAbertura,
		Status:                req.Status,
	}

	// Processar campos personalizados se fornecidos
	if len(req.CamposPersonalizados) > 0 {
		for _, campo := range req.CamposPersonalizados {
			cliente.CamposPersonalizados = append(cliente.CamposPersonalizados, models.ClienteCampoPersonalizado{
				Nome:  campo.Nome,
				Valor: campo.Valor,
				Ordem: campo.Ordem,
			})
		}
	}
	
	if err := s.db.Create(cliente).Error; err != nil {
		return nil, err
	}
	
	return cliente, nil
}

func (s *ClienteService) Update(id uint, req *models.UpdateClienteRequest) (*models.Cliente, error) {
	cliente, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}
	
	updates := make(map[string]interface{})

	// Dados Básicos
	if req.CPF != "" {
		updates["cpf"] = req.CPF
	}
	if req.IeRg != "" {
		updates["ieRg"] = req.IeRg
	}
	if req.InscricaoMunicipal != "" {
		updates["inscricaoMunicipal"] = req.InscricaoMunicipal
	}
	if req.Nome != "" {
		updates["nome"] = req.Nome
	}
	if req.NomeFantasia != "" {
		updates["nomeFantasia"] = req.NomeFantasia
	}
	if req.TipoContato != "" {
		updates["tipoContato"] = req.TipoContato
	}
	if req.ConsumidorFinal != nil {
		updates["consumidorFinal"] = *req.ConsumidorFinal
	}

	// Contatos
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.PontoReferencia != "" {
		updates["pontoReferencia"] = req.PontoReferencia
	}
	if req.TelefoneFixo != "" {
		updates["telefoneFixo"] = req.TelefoneFixo
	}
	if req.TelefoneAlternativo != "" {
		updates["telefoneAlternativo"] = req.TelefoneAlternativo
	}
	if req.Celular != "" {
		updates["celular"] = req.Celular
	}

	// Endereço Principal
	if req.CEP != "" {
		updates["cep"] = req.CEP
	}
	if req.Endereco != "" {
		updates["endereco"] = req.Endereco
	}
	if req.Numero != "" {
		updates["numero"] = req.Numero
	}
	if req.Complemento != "" {
		updates["complemento"] = req.Complemento
	}
	if req.Bairro != "" {
		updates["bairro"] = req.Bairro
	}
	if req.Cidade != "" {
		updates["cidade"] = req.Cidade
	}
	if req.Estado != "" {
		updates["estado"] = req.Estado
	}
	if req.CodigoIbge != "" {
		updates["codigoIbge"] = req.CodigoIbge
	}

	// Endereço de Entrega
	if req.CEPEntrega != "" {
		updates["cepEntrega"] = req.CEPEntrega
	}
	if req.EnderecoEntrega != "" {
		updates["enderecoEntrega"] = req.EnderecoEntrega
	}
	if req.NumeroEntrega != "" {
		updates["numeroEntrega"] = req.NumeroEntrega
	}
	if req.ComplementoEntrega != "" {
		updates["complementoEntrega"] = req.ComplementoEntrega
	}
	if req.BairroEntrega != "" {
		updates["bairroEntrega"] = req.BairroEntrega
	}
	if req.CidadeEntrega != "" {
		updates["cidadeEntrega"] = req.CidadeEntrega
	}
	if req.EstadoEntrega != "" {
		updates["estadoEntrega"] = req.EstadoEntrega
	}

	// Dados Financeiros
	if req.LimiteCredito != "" {
		updates["limiteCredito"] = req.LimiteCredito
	}
	if req.SaldoInicial != "" {
		updates["saldoInicial"] = req.SaldoInicial
	}
	if req.PrazoPagamento != "" {
		updates["prazoPagamento"] = req.PrazoPagamento
	}

	// Campos de Sistema
	if req.DataNascimento != "" {
		updates["dataNascimento"] = req.DataNascimento
	}
	if req.DataAbertura != "" {
		updates["dataAbertura"] = req.DataAbertura
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.UltimaCompra != "" {
		updates["ultimaCompra"] = req.UltimaCompra
	}

	// Atualizar campos principais
	if err := s.db.Model(cliente).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Processar campos personalizados se fornecidos
	if len(req.CamposPersonalizados) > 0 {
		// Remover campos personalizados existentes
		if err := s.db.Where("clienteId = ?", cliente.ID).Delete(&models.ClienteCampoPersonalizado{}).Error; err != nil {
			return nil, err
		}

		// Adicionar novos campos personalizados
		for _, campo := range req.CamposPersonalizados {
			novoCampo := models.ClienteCampoPersonalizado{
				ClienteID: cliente.ID,
				Nome:      campo.Nome,
				Valor:     campo.Valor,
				Ordem:     campo.Ordem,
			}
			if err := s.db.Create(&novoCampo).Error; err != nil {
				return nil, err
			}
		}
	}
	
	return cliente, nil
}

func (s *ClienteService) Delete(id uint) error {
	cliente, err := s.GetByID(id)
	if err != nil {
		return err
	}
	
	if err := s.db.Delete(cliente).Error; err != nil {
		return err
	}
	
	return nil
}

func (s *ClienteService) GetByStatus(status string) ([]models.Cliente, error) {
	var clientes []models.Cliente
	
	if err := s.db.Where("status = ?", status).Order(`"dataCadastro" DESC`).Find(&clientes).Error; err != nil {
		return nil, err
	}
	
	return clientes, nil
}

// GetByCategoria removido - campo categoria não existe mais na tabela clientes

func (s *ClienteService) Search(query string) ([]models.Cliente, error) {
	var clientes []models.Cliente
	
	searchPattern := "%" + query + "%"
	
	if err := s.db.Where("nome ILIKE ? OR email ILIKE ? OR cpf ILIKE ?", searchPattern, searchPattern, searchPattern).
		Order(`"dataCadastro" DESC`).
		Find(&clientes).Error; err != nil {
		return nil, err
	}
	
	return clientes, nil
}

func (s *ClienteService) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	var total int64
	s.db.Model(&models.Cliente{}).Count(&total)
	stats["total"] = total
	
	var ativos int64
	s.db.Model(&models.Cliente{}).Where("status = ?", "Ativo").Count(&ativos)
	stats["ativos"] = ativos
	
	var inativos int64
	s.db.Model(&models.Cliente{}).Where("status = ?", "Inativo").Count(&inativos)
	stats["inativos"] = inativos
	
	// Estatísticas por categoria removidas - campo categoria não existe mais
	
	return stats, nil
}

