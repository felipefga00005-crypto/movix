package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type TabelasFiscaisService struct {
	db         *gorm.DB
	httpClient *http.Client
}

func NewTabelasFiscaisService(db *gorm.DB) *TabelasFiscaisService {
	return &TabelasFiscaisService{
		db: db,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ============================================
// MÉTODOS DE SINCRONIZAÇÃO
// ============================================

// SyncNCM sincroniza tabela NCM da API da Receita Federal
func (s *TabelasFiscaisService) SyncNCM(forcarSync bool) error {
	// Verifica se precisa sincronizar
	if !forcarSync {
		metadata, err := s.GetMetadata("ncm")
		if err == nil && metadata != nil {
			// Se sincronizou há menos de 7 dias, não sincroniza novamente
			if time.Since(metadata.UltimaSync) < 7*24*time.Hour {
				return nil
			}
		}
	}

	// URL da API oficial da Receita Federal
	url := "https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json"
	
	resp, err := s.httpClient.Get(url)
	if err != nil {
		return fmt.Errorf("erro ao buscar dados NCM: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("erro HTTP %d ao buscar NCM", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("erro ao ler resposta NCM: %v", err)
	}

	var ncmData []models.NCMResponse
	if err := json.Unmarshal(body, &ncmData); err != nil {
		return fmt.Errorf("erro ao decodificar JSON NCM: %v", err)
	}

	// Converte para modelo interno
	var ncms []models.NCM
	for _, item := range ncmData {
		ncm := models.NCM{
			Codigo:    item.Codigo,
			Descricao: item.Descricao,
			Ativo:     true,
		}
		ncms = append(ncms, ncm)
	}

	// Salva no banco em transação
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Remove registros antigos
		if err := tx.Exec("DELETE FROM ncms").Error; err != nil {
			return err
		}

		// Insere novos registros em lotes
		batchSize := 1000
		for i := 0; i < len(ncms); i += batchSize {
			end := i + batchSize
			if end > len(ncms) {
				end = len(ncms)
			}
			
			if err := tx.Create(ncms[i:end]).Error; err != nil {
				return err
			}
		}

		// Atualiza metadata
		return s.UpdateMetadata("ncm", len(ncms), url)
	})
}

// SyncCFOP sincroniza tabela CFOP (dados estáticos)
func (s *TabelasFiscaisService) SyncCFOP(forcarSync bool) error {
	// Verifica se já existe dados
	var count int64
	s.db.Model(&models.CFOP{}).Count(&count)
	
	if count > 0 && !forcarSync {
		return nil // Já tem dados
	}

	// Usa dados estáticos (CFOPs não mudam frequentemente)
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Remove registros antigos se forçar sync
		if forcarSync {
			if err := tx.Exec("DELETE FROM cfops").Error; err != nil {
				return err
			}
		}

		// Insere CFOPs comuns
		for _, cfop := range models.CFOPsComuns {
			if err := tx.Create(&cfop).Error; err != nil {
				return err
			}
		}

		// Atualiza metadata
		return s.UpdateMetadata("cfop", len(models.CFOPsComuns), "dados_estaticos")
	})
}

// SyncCST sincroniza tabela CST (dados estáticos)
func (s *TabelasFiscaisService) SyncCST(forcarSync bool) error {
	var count int64
	s.db.Model(&models.CST{}).Count(&count)
	
	if count > 0 && !forcarSync {
		return nil
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		if forcarSync {
			if err := tx.Exec("DELETE FROM csts").Error; err != nil {
				return err
			}
		}

		for _, cst := range models.CSTsComuns {
			if err := tx.Create(&cst).Error; err != nil {
				return err
			}
		}

		return s.UpdateMetadata("cst", len(models.CSTsComuns), "dados_estaticos")
	})
}

// SyncCSOSN sincroniza tabela CSOSN (dados estáticos)
func (s *TabelasFiscaisService) SyncCSOSN(forcarSync bool) error {
	var count int64
	s.db.Model(&models.CSOSN{}).Count(&count)
	
	if count > 0 && !forcarSync {
		return nil
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		if forcarSync {
			if err := tx.Exec("DELETE FROM csosns").Error; err != nil {
				return err
			}
		}

		for _, csosn := range models.CSOSNsComuns {
			if err := tx.Create(&csosn).Error; err != nil {
				return err
			}
		}

		return s.UpdateMetadata("csosn", len(models.CSOSNsComuns), "dados_estaticos")
	})
}

// SyncUnidadesMedida sincroniza unidades de medida (dados estáticos)
func (s *TabelasFiscaisService) SyncUnidadesMedida(forcarSync bool) error {
	var count int64
	s.db.Model(&models.UnidadeMedida{}).Count(&count)
	
	if count > 0 && !forcarSync {
		return nil
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		if forcarSync {
			if err := tx.Exec("DELETE FROM unidades_medida").Error; err != nil {
				return err
			}
		}

		for _, unidade := range models.UnidadesMedidaComuns {
			if err := tx.Create(&unidade).Error; err != nil {
				return err
			}
		}

		return s.UpdateMetadata("unidades_medida", len(models.UnidadesMedidaComuns), "dados_estaticos")
	})
}

// SyncTodasTabelas sincroniza todas as tabelas fiscais
func (s *TabelasFiscaisService) SyncTodasTabelas(forcarSync bool) error {
	if err := s.SyncCFOP(forcarSync); err != nil {
		return fmt.Errorf("erro ao sincronizar CFOP: %v", err)
	}

	if err := s.SyncCST(forcarSync); err != nil {
		return fmt.Errorf("erro ao sincronizar CST: %v", err)
	}

	if err := s.SyncCSOSN(forcarSync); err != nil {
		return fmt.Errorf("erro ao sincronizar CSOSN: %v", err)
	}

	if err := s.SyncUnidadesMedida(forcarSync); err != nil {
		return fmt.Errorf("erro ao sincronizar Unidades de Medida: %v", err)
	}

	// NCM por último pois é mais pesado
	if err := s.SyncNCM(forcarSync); err != nil {
		return fmt.Errorf("erro ao sincronizar NCM: %v", err)
	}

	return nil
}

// ============================================
// MÉTODOS DE CONSULTA
// ============================================

// BuscarNCM busca NCMs por código ou descrição
func (s *TabelasFiscaisService) BuscarNCM(codigo, descricao string, limit int) ([]models.NCM, error) {
	var ncms []models.NCM
	query := s.db.Model(&models.NCM{}).Where("ativo = ?", true)

	if codigo != "" {
		query = query.Where("codigo LIKE ?", codigo+"%")
	}

	if descricao != "" {
		query = query.Where("LOWER(descricao) LIKE ?", "%"+strings.ToLower(descricao)+"%")
	}

	if limit <= 0 {
		limit = 50
	}

	return ncms, query.Limit(limit).Order("codigo ASC").Find(&ncms).Error
}

// BuscarCFOP busca CFOPs por código, descrição ou aplicação
func (s *TabelasFiscaisService) BuscarCFOP(codigo, descricao, aplicacao string, limit int) ([]models.CFOP, error) {
	var cfops []models.CFOP
	query := s.db.Model(&models.CFOP{}).Where("ativo = ?", true)

	if codigo != "" {
		query = query.Where("codigo LIKE ?", codigo+"%")
	}

	if descricao != "" {
		query = query.Where("LOWER(descricao) LIKE ?", "%"+strings.ToLower(descricao)+"%")
	}

	if aplicacao != "" {
		query = query.Where("aplicacao = ?", aplicacao)
	}

	if limit <= 0 {
		limit = 50
	}

	return cfops, query.Limit(limit).Order("codigo ASC").Find(&cfops).Error
}

// GetCSTPorTipo retorna CSTs por tipo (ICMS, IPI, PIS, COFINS)
func (s *TabelasFiscaisService) GetCSTPorTipo(tipo string) ([]models.CST, error) {
	var csts []models.CST
	return csts, s.db.Where("tipo = ? AND ativo = ?", tipo, true).Order("codigo ASC").Find(&csts).Error
}

// GetCSOSNAtivos retorna todos os CSOSNs ativos
func (s *TabelasFiscaisService) GetCSOSNAtivos() ([]models.CSOSN, error) {
	var csosns []models.CSOSN
	return csosns, s.db.Where("ativo = ?", true).Order("codigo ASC").Find(&csosns).Error
}

// GetUnidadesMedida retorna todas as unidades de medida ativas
func (s *TabelasFiscaisService) GetUnidadesMedida() ([]models.UnidadeMedida, error) {
	var unidades []models.UnidadeMedida
	return unidades, s.db.Where("ativo = ?", true).Order("codigo ASC").Find(&unidades).Error
}

// ============================================
// MÉTODOS DE METADATA
// ============================================

// GetMetadata retorna metadata de sincronização de uma tabela
func (s *TabelasFiscaisService) GetMetadata(tabela string) (*models.TabelaFiscalMetadata, error) {
	var metadata models.TabelaFiscalMetadata
	err := s.db.Where("tabela = ?", tabela).First(&metadata).Error
	if err != nil {
		return nil, err
	}
	return &metadata, nil
}

// UpdateMetadata atualiza metadata de sincronização
func (s *TabelasFiscaisService) UpdateMetadata(tabela string, totalRegistros int, fonteDados string) error {
	metadata := models.TabelaFiscalMetadata{
		Tabela:         tabela,
		UltimaSync:     time.Now(),
		TotalRegistros: totalRegistros,
		FonteDados:     fonteDados,
	}

	return s.db.Save(&metadata).Error
}

// GetStatusSync retorna status de sincronização de todas as tabelas
func (s *TabelasFiscaisService) GetStatusSync() (map[string]interface{}, error) {
	tabelas := []string{"ncm", "cfop", "cst", "csosn", "unidades_medida"}
	status := make(map[string]interface{})

	for _, tabela := range tabelas {
		metadata, err := s.GetMetadata(tabela)
		if err != nil {
			status[tabela] = map[string]interface{}{
				"sincronizado": false,
				"erro":         err.Error(),
			}
			continue
		}

		status[tabela] = map[string]interface{}{
			"sincronizado":     true,
			"ultima_sync":      metadata.UltimaSync,
			"total_registros":  metadata.TotalRegistros,
			"fonte_dados":      metadata.FonteDados,
			"dias_desde_sync":  int(time.Since(metadata.UltimaSync).Hours() / 24),
		}
	}

	return status, nil
}
