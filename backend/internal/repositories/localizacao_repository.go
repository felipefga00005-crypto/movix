// ============================================
// LOCALIZAÇÃO REPOSITORIES
// ============================================

package repositories

import (
	"errors"
	"time"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// ============================================
// ESTADO REPOSITORY
// ============================================

type estadoRepository struct {
	*baseRepository[models.Estado]
}

// NewEstadoRepository cria uma nova instância do repository de estados
func NewEstadoRepository(db *gorm.DB) EstadoRepository {
	return &estadoRepository{
		baseRepository: newBaseRepository[models.Estado](db),
	}
}

// GetBySigla busca estado por sigla
func (r *estadoRepository) GetBySigla(sigla string) (*models.Estado, error) {
	var estado models.Estado
	if err := r.db.Where("sigla = ?", sigla).First(&estado).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("estado não encontrado")
		}
		return nil, err
	}
	return &estado, nil
}

// GetByCodigo busca estado por código IBGE
func (r *estadoRepository) GetByCodigo(codigo int) (*models.Estado, error) {
	var estado models.Estado
	if err := r.db.Where("codigo = ?", codigo).First(&estado).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("estado não encontrado")
		}
		return nil, err
	}
	return &estado, nil
}

// GetWithRegiao busca todos os estados com suas regiões
func (r *estadoRepository) GetWithRegiao() ([]models.Estado, error) {
	var estados []models.Estado
	if err := r.db.Preload("Regiao").Order("nome ASC").Find(&estados).Error; err != nil {
		return nil, err
	}
	return estados, nil
}

// ============================================
// CIDADE REPOSITORY
// ============================================

type cidadeRepository struct {
	*baseRepository[models.Cidade]
}

// NewCidadeRepository cria uma nova instância do repository de cidades
func NewCidadeRepository(db *gorm.DB) CidadeRepository {
	return &cidadeRepository{
		baseRepository: newBaseRepository[models.Cidade](db),
	}
}

// GetByEstado busca cidades por estado ID
func (r *cidadeRepository) GetByEstado(estadoID uint) ([]models.Cidade, error) {
	var cidades []models.Cidade
	if err := r.db.Where("estado_id = ?", estadoID).Order("nome ASC").Find(&cidades).Error; err != nil {
		return nil, err
	}
	return cidades, nil
}

// GetByCodigoIBGE busca cidade por código IBGE
func (r *cidadeRepository) GetByCodigoIBGE(codigo string) (*models.Cidade, error) {
	var cidade models.Cidade
	if err := r.db.Where("codigo_ibge = ?", codigo).First(&cidade).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cidade não encontrada")
		}
		return nil, err
	}
	return &cidade, nil
}

// GetByEstadoSigla busca cidades por sigla do estado
func (r *cidadeRepository) GetByEstadoSigla(sigla string) ([]models.Cidade, error) {
	var cidades []models.Cidade
	if err := r.db.Joins("JOIN estados ON cidades.estado_id = estados.id").
		Where("estados.sigla = ?", sigla).
		Order("cidades.nome ASC").
		Find(&cidades).Error; err != nil {
		return nil, err
	}
	return cidades, nil
}

// ============================================
// CACHE METADATA REPOSITORY
// ============================================

type cacheMetadataRepository struct {
	*baseRepository[models.CacheMetadata]
}

// NewCacheMetadataRepository cria uma nova instância do repository de cache metadata
func NewCacheMetadataRepository(db *gorm.DB) CacheMetadataRepository {
	return &cacheMetadataRepository{
		baseRepository: newBaseRepository[models.CacheMetadata](db),
	}
}

// GetByTipo busca metadata por tipo
func (r *cacheMetadataRepository) GetByTipo(tipo string) (*models.CacheMetadata, error) {
	var metadata models.CacheMetadata
	if err := r.db.Where("tipo = ?", tipo).First(&metadata).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("metadata não encontrada")
		}
		return nil, err
	}
	return &metadata, nil
}

// UpdateSync atualiza o timestamp de sincronização
func (r *cacheMetadataRepository) UpdateSync(tipo string) error {
	now := time.Now()
	
	// Tenta atualizar primeiro
	result := r.db.Model(&models.CacheMetadata{}).Where("tipo = ?", tipo).Update("ultima_sync", now)
	
	// Se não encontrou registro, cria um novo
	if result.RowsAffected == 0 {
		metadata := &models.CacheMetadata{
			Tipo:       tipo,
			UltimaSync: now,
		}
		if err := r.db.Create(metadata).Error; err != nil {
			return err
		}
	}
	
	return result.Error
}
