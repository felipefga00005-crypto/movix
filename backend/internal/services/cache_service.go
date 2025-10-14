package services

import (
	"errors"
	"time"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

type CacheService struct {
	db *gorm.DB
}

func NewCacheService(db *gorm.DB) *CacheService {
	return &CacheService{
		db: db,
	}
}

// GetEstados retorna todos os estados com suas regiões
func (s *CacheService) GetEstados() ([]models.Estado, error) {
	var estados []models.Estado
	if err := s.db.Preload("Regiao").Find(&estados).Error; err != nil {
		return nil, err
	}
	return estados, nil
}

// GetEstadoBySigla retorna um estado por sigla
func (s *CacheService) GetEstadoBySigla(sigla string) (*models.Estado, error) {
	var estado models.Estado
	if err := s.db.Preload("Regiao").Where("sigla = ?", sigla).First(&estado).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("estado não encontrado")
		}
		return nil, err
	}
	return &estado, nil
}

// GetCidadesByEstado retorna cidades por ID do estado
func (s *CacheService) GetCidadesByEstado(estadoID uint) ([]models.Cidade, error) {
	var cidades []models.Cidade
	if err := s.db.Where("estado_id = ?", estadoID).Order("nome ASC").Find(&cidades).Error; err != nil {
		return nil, err
	}
	return cidades, nil
}

// GetCidadesByEstadoSigla retorna cidades por sigla do estado
func (s *CacheService) GetCidadesByEstadoSigla(sigla string) ([]models.Cidade, error) {
	// Primeiro busca o estado
	estado, err := s.GetEstadoBySigla(sigla)
	if err != nil {
		return nil, err
	}

	// Depois busca as cidades
	return s.GetCidadesByEstado(estado.ID)
}

// GetCidadeByCodigoIBGE retorna uma cidade por código IBGE
func (s *CacheService) GetCidadeByCodigoIBGE(codigoIBGE string) (*models.Cidade, error) {
	var cidade models.Cidade
	if err := s.db.Preload("Estado").Where("codigo_ibge = ?", codigoIBGE).First(&cidade).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cidade não encontrada")
		}
		return nil, err
	}
	return &cidade, nil
}

// UpdateSyncMetadata atualiza metadata de sincronização
func (s *CacheService) UpdateSyncMetadata(tipo string) error {
	var metadata models.CacheMetadata

	// Busca ou cria o registro
	result := s.db.Where("tipo = ?", tipo).First(&metadata)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Cria novo registro
		metadata = models.CacheMetadata{
			Tipo:       tipo,
			UltimaSync: time.Now(),
		}
		return s.db.Create(&metadata).Error
	}

	// Atualiza registro existente
	metadata.UltimaSync = time.Now()
	return s.db.Save(&metadata).Error
}

// GetSyncMetadata retorna metadata de sincronização
func (s *CacheService) GetSyncMetadata(tipo string) (*models.CacheMetadata, error) {
	var metadata models.CacheMetadata
	if err := s.db.Where("tipo = ?", tipo).First(&metadata).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &metadata, nil
}

// ForceSync força sincronização de dados
func (s *CacheService) ForceSync() error {
	// Implementação básica - apenas atualiza timestamp
	return s.UpdateSyncMetadata("force_sync")
}

// SyncEstados sincroniza estados no cache
func (s *CacheService) SyncEstados(estados []models.Estado) error {
	// Inicia transação
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Remove estados antigos
		if err := tx.Exec("DELETE FROM estados").Error; err != nil {
			return err
		}

		// Insere novos estados
		if err := tx.Create(&estados).Error; err != nil {
			return err
		}

		// Atualiza metadata
		return s.UpdateSyncMetadata("estados")
	})
}

// SyncCidades sincroniza cidades no cache
func (s *CacheService) SyncCidades(cidades []models.Cidade) error {
	// Inicia transação
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Remove cidades antigas
		if err := tx.Exec("DELETE FROM cidades").Error; err != nil {
			return err
		}

		// Insere novas cidades
		if err := tx.Create(&cidades).Error; err != nil {
			return err
		}

		// Atualiza metadata
		return s.UpdateSyncMetadata("cidades")
	})
}
