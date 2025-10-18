package services

import (
	"fmt"
	"time"
	"strconv"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type VendaService struct {
	db *gorm.DB
}

func NewVendaService(db *gorm.DB) *VendaService {
	return &VendaService{db: db}
}

// CreateVenda cria uma nova venda
func (s *VendaService) CreateVenda(userID uint, request models.CreateVendaRequest) (*models.Venda, error) {
	// Gerar número da venda
	numeroVenda, err := s.gerarNumeroVenda()
	if err != nil {
		return nil, fmt.Errorf("erro ao gerar número da venda: %v", err)
	}

	// Criar venda
	venda := &models.Venda{
		NumeroVenda:    numeroVenda,
		ClienteID:      request.ClienteID,
		UsuarioID:      userID,
		NaturezaOpID:   request.NaturezaOpID,
		FormaPagamento: request.FormaPagamento,
		ValorPago:      request.ValorPago,
		Observacoes:    request.Observacoes,
		Status:         "pendente",
		NFCeStatus:     "nao_emitida",
	}

	// Calcular totais e criar itens
	var totalProdutos, totalDesconto float64
	var itens []models.ItemVenda

	for _, itemReq := range request.Itens {
		// Buscar produto para validar
		var produto models.Produto
		if err := s.db.First(&produto, itemReq.ProdutoID).Error; err != nil {
			return nil, fmt.Errorf("produto ID %d não encontrado", itemReq.ProdutoID)
		}

		valorTotal := (itemReq.ValorUnit * itemReq.Quantidade) - itemReq.ValorDesc
		
		item := models.ItemVenda{
			ProdutoID:  itemReq.ProdutoID,
			Quantidade: itemReq.Quantidade,
			ValorUnit:  itemReq.ValorUnit,
			ValorDesc:  itemReq.ValorDesc,
			ValorTotal: valorTotal,
		}

		itens = append(itens, item)
		totalProdutos += itemReq.ValorUnit * itemReq.Quantidade
		totalDesconto += itemReq.ValorDesc
	}

	venda.TotalProdutos = totalProdutos
	venda.TotalDesconto = totalDesconto
	venda.TotalVenda = totalProdutos - totalDesconto
	venda.ValorTroco = request.ValorPago - venda.TotalVenda

	// Salvar em transação
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// Criar venda
		if err := tx.Create(venda).Error; err != nil {
			return err
		}

		// Criar itens
		for i := range itens {
			itens[i].VendaID = venda.ID
		}
		if err := tx.Create(&itens).Error; err != nil {
			return err
		}

		venda.Itens = itens
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("erro ao criar venda: %v", err)
	}

	return venda, nil
}

// GetVendaByID busca uma venda por ID
func (s *VendaService) GetVendaByID(id uint) (*models.Venda, error) {
	var venda models.Venda
	err := s.db.Preload("Cliente").
		Preload("Usuario").
		Preload("NaturezaOp").
		Preload("Itens.Produto").
		First(&venda, id).Error
	
	if err != nil {
		return nil, err
	}

	return &venda, nil
}

// GetVendas lista vendas com filtros
func (s *VendaService) GetVendas(filter models.VendaFilter) ([]models.Venda, int64, error) {
	query := s.db.Model(&models.Venda{}).
		Preload("Cliente").
		Preload("Usuario").
		Preload("NaturezaOp").
		Preload("Itens.Produto")

	// Aplicar filtros
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.NFCeStatus != "" {
		query = query.Where("nfce_status = ?", filter.NFCeStatus)
	}
	if filter.ClienteID != nil {
		query = query.Where("cliente_id = ?", *filter.ClienteID)
	}
	if filter.UsuarioID != nil {
		query = query.Where("usuario_id = ?", *filter.UsuarioID)
	}
	if filter.DataInicio != nil {
		query = query.Where("created_at >= ?", *filter.DataInicio)
	}
	if filter.DataFim != nil {
		query = query.Where("created_at <= ?", *filter.DataFim)
	}
	if filter.NumeroVenda != "" {
		query = query.Where("numero_venda LIKE ?", "%"+filter.NumeroVenda+"%")
	}
	if filter.NFCeChave != "" {
		query = query.Where("nfce_chave = ?", filter.NFCeChave)
	}

	// Contar total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Aplicar paginação
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	// Buscar vendas
	var vendas []models.Venda
	if err := query.Order("created_at DESC").Find(&vendas).Error; err != nil {
		return nil, 0, err
	}

	return vendas, total, nil
}

// FinalizarVenda finaliza uma venda pendente
func (s *VendaService) FinalizarVenda(id uint, request models.FinalizarVendaRequest) (*models.Venda, error) {
	var venda models.Venda
	if err := s.db.First(&venda, id).Error; err != nil {
		return nil, err
	}

	if !venda.IsPendente() {
		return nil, fmt.Errorf("venda não está pendente")
	}

	// Atualizar dados de pagamento
	venda.FormaPagamento = request.FormaPagamento
	venda.ValorPago = request.ValorPago
	venda.ValorTroco = request.ValorPago - venda.TotalVenda
	venda.Status = "finalizada"

	if err := s.db.Save(&venda).Error; err != nil {
		return nil, fmt.Errorf("erro ao finalizar venda: %v", err)
	}

	return &venda, nil
}

// CancelarVenda cancela uma venda
func (s *VendaService) CancelarVenda(id uint) (*models.Venda, error) {
	var venda models.Venda
	if err := s.db.First(&venda, id).Error; err != nil {
		return nil, err
	}

	if venda.IsNFCeEmitida() {
		return nil, fmt.Errorf("não é possível cancelar venda com NFCe emitida")
	}

	venda.Status = "cancelada"
	if err := s.db.Save(&venda).Error; err != nil {
		return nil, fmt.Errorf("erro ao cancelar venda: %v", err)
	}

	return &venda, nil
}

// UpdateVendaNFCe atualiza dados da NFCe na venda
func (s *VendaService) UpdateVendaNFCe(id uint, nfceData map[string]interface{}) error {
	updates := make(map[string]interface{})

	if chave, ok := nfceData["chave_acesso"].(string); ok {
		updates["nfce_chave"] = chave
	}
	if numero, ok := nfceData["numero"].(string); ok {
		updates["nfce_numero"] = numero
	}
	if protocolo, ok := nfceData["protocolo_autorizacao"].(string); ok {
		updates["nfce_protocolo"] = protocolo
	}
	if dataAut, ok := nfceData["data_autorizacao"].(time.Time); ok {
		updates["nfce_data_aut"] = dataAut
	}
	if xml, ok := nfceData["xml"].(string); ok {
		updates["nfce_xml"] = xml
	}
	if status, ok := nfceData["status"].(string); ok {
		updates["nfce_status"] = status
	}

	return s.db.Model(&models.Venda{}).Where("id = ?", id).Updates(updates).Error
}

// GetVendasParaNFCe busca vendas que podem emitir NFCe
func (s *VendaService) GetVendasParaNFCe() ([]models.Venda, error) {
	var vendas []models.Venda
	err := s.db.Where("status = ? AND nfce_status = ?", "finalizada", "nao_emitida").
		Preload("Cliente").
		Preload("NaturezaOp").
		Preload("Itens.Produto").
		Find(&vendas).Error
	
	return vendas, err
}

// ConvertToResponse converte Venda para VendaResponse
func (s *VendaService) ConvertToResponse(venda *models.Venda) *models.VendaResponse {
	response := &models.VendaResponse{
		ID:                  venda.ID,
		NumeroVenda:         venda.NumeroVenda,
		ClienteID:           venda.ClienteID,
		UsuarioID:           venda.UsuarioID,
		NaturezaOpID:        venda.NaturezaOpID,
		TotalProdutos:       venda.TotalProdutos,
		TotalDesconto:       venda.TotalDesconto,
		TotalVenda:          venda.TotalVenda,
		Status:              venda.Status,
		NFCeNumero:          venda.NFCeNumero,
		NFCeChave:           venda.NFCeChave,
		NFCeStatus:          venda.NFCeStatus,
		NFCeProtocolo:       venda.NFCeProtocolo,
		NFCeDataAut:         venda.NFCeDataAut,
		FormaPagamento:      venda.FormaPagamento,
		DescricaoFormaPagto: venda.GetDescricaoFormaPagamento(),
		ValorPago:           venda.ValorPago,
		ValorTroco:          venda.ValorTroco,
		Observacoes:         venda.Observacoes,
		CreatedAt:           venda.CreatedAt,
		UpdatedAt:           venda.UpdatedAt,
		CanEmitirNFCe:       venda.CanEmitirNFCe(),
		CanCancelarNFCe:     venda.CanCancelarNFCe(),
	}

	// Cliente
	if venda.Cliente != nil {
		response.Cliente = &models.ClienteResumo{
			ID:   venda.Cliente.ID,
			Nome: venda.Cliente.Nome,
			Email: venda.Cliente.Email,
			CPF:  venda.Cliente.CPF,
			CNPJ: venda.Cliente.CNPJ,
		}
	}

	// Usuario
	response.Usuario = &models.UsuarioResumo{
		ID:    venda.Usuario.ID,
		Nome:  venda.Usuario.Nome,
		Email: venda.Usuario.Email,
	}

	// Natureza de Operação
	response.NaturezaOperacao = &models.NaturezaOpResumo{
		ID:        venda.NaturezaOp.ID,
		Codigo:    venda.NaturezaOp.Codigo,
		Descricao: venda.NaturezaOp.Descricao,
	}

	// Itens
	for _, item := range venda.Itens {
		itemResponse := models.ItemVendaResponse{
			ID:         item.ID,
			VendaID:    item.VendaID,
			ProdutoID:  item.ProdutoID,
			Quantidade: item.Quantidade,
			ValorUnit:  item.ValorUnit,
			ValorDesc:  item.ValorDesc,
			ValorTotal: item.ValorTotal,
		}

		if item.Produto.ID > 0 {
			itemResponse.Produto = &models.ProdutoResumo{
				ID:     item.Produto.ID,
				Nome:   item.Produto.Nome,
				Codigo: item.Produto.Codigo,
				Preco:  item.Produto.Preco,
				NCM:    item.Produto.NCM,
			}
		}

		response.Itens = append(response.Itens, itemResponse)
	}

	return response
}

// gerarNumeroVenda gera um número único para a venda
func (s *VendaService) gerarNumeroVenda() (string, error) {
	// Buscar último número
	var ultimaVenda models.Venda
	err := s.db.Order("id DESC").First(&ultimaVenda).Error
	
	var proximoNumero int64 = 1
	if err == nil {
		// Extrair número da última venda (formato: VENDA-000001)
		if len(ultimaVenda.NumeroVenda) > 6 {
			numeroStr := ultimaVenda.NumeroVenda[6:] // Remove "VENDA-"
			if num, err := strconv.ParseInt(numeroStr, 10, 64); err == nil {
				proximoNumero = num + 1
			}
		}
	}

	return fmt.Sprintf("VENDA-%06d", proximoNumero), nil
}
