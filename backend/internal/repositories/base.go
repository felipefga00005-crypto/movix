// ============================================
// REPOSITORY BASE
// ============================================

package repositories

import (
	"errors"
	"reflect"

	"gorm.io/gorm"
)

// ============================================
// IMPLEMENTAÇÃO BASE
// ============================================

// baseRepository implementa operações CRUD básicas
type baseRepository[T any] struct {
	db *gorm.DB
}

// newBaseRepository cria uma nova instância do repository base
func newBaseRepository[T any](db *gorm.DB) *baseRepository[T] {
	return &baseRepository[T]{
		db: db,
	}
}

// Create cria uma nova entidade
func (r *baseRepository[T]) Create(entity *T) error {
	if err := r.db.Create(entity).Error; err != nil {
		return err
	}
	return nil
}

// GetByID busca uma entidade por ID
func (r *baseRepository[T]) GetByID(id uint) (*T, error) {
	var entity T
	if err := r.db.First(&entity, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("registro não encontrado")
		}
		return nil, err
	}
	return &entity, nil
}

// GetAll retorna todas as entidades
func (r *baseRepository[T]) GetAll() ([]T, error) {
	var entities []T
	if err := r.db.Find(&entities).Error; err != nil {
		return nil, err
	}
	return entities, nil
}

// Update atualiza uma entidade
func (r *baseRepository[T]) Update(entity *T) error {
	if err := r.db.Save(entity).Error; err != nil {
		return err
	}
	return nil
}

// Delete remove uma entidade por ID (soft delete)
func (r *baseRepository[T]) Delete(id uint) error {
	var entity T
	if err := r.db.Delete(&entity, id).Error; err != nil {
		return err
	}
	return nil
}

// Count retorna o total de registros
func (r *baseRepository[T]) Count() (int64, error) {
	var count int64
	var entity T
	if err := r.db.Model(&entity).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// ============================================
// MÉTODOS AUXILIARES
// ============================================

// getTableName retorna o nome da tabela baseado no tipo
func (r *baseRepository[T]) getTableName() string {
	var entity T
	entityType := reflect.TypeOf(entity)
	
	// Se for um ponteiro, pega o tipo subjacente
	if entityType.Kind() == reflect.Ptr {
		entityType = entityType.Elem()
	}
	
	// Retorna o nome do tipo em minúsculo + 's' (convenção básica)
	// Para casos específicos, os repositories individuais podem sobrescrever
	return entityType.Name() + "s"
}

// buildSearchQuery constrói uma query de busca básica
func (r *baseRepository[T]) buildSearchQuery(query string, fields []string) *gorm.DB {
	db := r.db
	searchPattern := "%" + query + "%"
	
	if len(fields) == 0 {
		return db
	}
	
	// Constrói a condição WHERE com OR para cada campo
	condition := ""
	args := make([]interface{}, 0, len(fields))
	
	for i, field := range fields {
		if i > 0 {
			condition += " OR "
		}
		condition += field + " ILIKE ?"
		args = append(args, searchPattern)
	}
	
	return db.Where(condition, args...)
}

// buildStatsQuery constrói queries básicas para estatísticas
func (r *baseRepository[T]) buildStatsQuery() map[string]interface{} {
	stats := make(map[string]interface{})
	var entity T
	
	// Total de registros
	var total int64
	r.db.Model(&entity).Count(&total)
	stats["total"] = total
	
	// Ativos (se o campo status existir)
	var ativos int64
	if err := r.db.Model(&entity).Where("status = ?", "Ativo").Count(&ativos).Error; err == nil {
		stats["ativos"] = ativos
	}
	
	// Inativos (se o campo status existir)
	var inativos int64
	if err := r.db.Model(&entity).Where("status = ?", "Inativo").Count(&inativos).Error; err == nil {
		stats["inativos"] = inativos
	}
	
	return stats
}
