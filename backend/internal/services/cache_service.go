package services

import (
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
)

type CacheService struct {
	cacheRepo  repositories.CacheMetadataRepository
	estadoRepo repositories.EstadoRepository
	cidadeRepo repositories.CidadeRepository
}

func NewCacheService(cacheRepo repositories.CacheMetadataRepository, estadoRepo repositories.EstadoRepository, cidadeRepo repositories.CidadeRepository) *CacheService {
	return &CacheService{
		cacheRepo:  cacheRepo,
		estadoRepo: estadoRepo,
		cidadeRepo: cidadeRepo,
	}
}

// GetEstados retorna todos os estados
func (s *CacheService) GetEstados() ([]models.Estado, error) {
	return s.estadoRepo.GetAll()
}

// GetEstadoBySigla retorna um estado por sigla
func (s *CacheService) GetEstadoBySigla(sigla string) (*models.Estado, error) {
	return s.estadoRepo.GetBySigla(sigla)
}

// GetCidadesByEstado retorna cidades por estado
func (s *CacheService) GetCidadesByEstado(estadoID uint) ([]models.Cidade, error) {
	return s.cidadeRepo.GetByEstado(estadoID)
}

// GetCidadesByEstadoSigla retorna cidades por sigla do estado
func (s *CacheService) GetCidadesByEstadoSigla(sigla string) ([]models.Cidade, error) {
	return s.cidadeRepo.GetByEstadoSigla(sigla)
}

// UpdateSyncMetadata atualiza metadata de sincronização
func (s *CacheService) UpdateSyncMetadata(tipo string) error {
	return s.cacheRepo.UpdateSync(tipo)
}

// GetSyncMetadata retorna metadata de sincronização
func (s *CacheService) GetSyncMetadata(tipo string) (*models.CacheMetadata, error) {
	return s.cacheRepo.GetByTipo(tipo)
}

// ForceSync força sincronização de dados
func (s *CacheService) ForceSync() error {
	// Implementação básica - apenas atualiza timestamp
	return s.cacheRepo.UpdateSync("force_sync")
}
