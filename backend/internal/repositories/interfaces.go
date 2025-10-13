// ============================================
// INTERFACES DOS REPOSITORIES
// ============================================

package repositories

import (
	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// ============================================
// INTERFACE BASE
// ============================================

// BaseRepository define operações CRUD básicas
type BaseRepository[T any] interface {
	Create(entity *T) error
	GetByID(id uint) (*T, error)
	GetAll() ([]T, error)
	Update(entity *T) error
	Delete(id uint) error
	Count() (int64, error)
}

// ============================================
// INTERFACES ESPECÍFICAS
// ============================================

// UserRepository define operações específicas para usuários
type UserRepository interface {
	BaseRepository[models.User]
	GetByEmail(email string) (*models.User, error)
	GetByCodigo(codigo string) (*models.User, error)
	GetByStatus(status string) ([]models.User, error)
	GetByPerfil(perfil string) ([]models.User, error)
	Search(query string) ([]models.User, error)
	UpdatePassword(id uint, hashedPassword string) error
	UpdateLastAccess(id uint) error
	GetStats() (map[string]interface{}, error)
}

// ClienteRepository define operações específicas para clientes
type ClienteRepository interface {
	BaseRepository[models.Cliente]
	GetByCPF(cpf string) (*models.Cliente, error)
	GetByEmail(email string) (*models.Cliente, error)
	GetByStatus(status string) ([]models.Cliente, error)
	Search(query string) ([]models.Cliente, error)
	GetStats() (map[string]interface{}, error)
	// Campos personalizados
	CreateCampoPersonalizado(campo *models.ClienteCampoPersonalizado) error
	GetCamposPersonalizados(clienteID uint) ([]models.ClienteCampoPersonalizado, error)
	DeleteCamposPersonalizados(clienteID uint) error
}

// ProdutoRepository define operações específicas para produtos
type ProdutoRepository interface {
	BaseRepository[models.Produto]
	GetByCodigo(codigo string) (*models.Produto, error)
	GetByStatus(status string) ([]models.Produto, error)
	GetByCategoria(categoria string) ([]models.Produto, error)
	GetEstoqueBaixo() ([]models.Produto, error)
	Search(query string) ([]models.Produto, error)
	UpdateEstoque(id uint, novoEstoque int) error
	GetStats() (map[string]interface{}, error)
}

// FornecedorRepository define operações específicas para fornecedores
type FornecedorRepository interface {
	BaseRepository[models.Fornecedor]
	GetByCNPJ(cnpj string) (*models.Fornecedor, error)
	GetByCodigo(codigo string) (*models.Fornecedor, error)
	GetByStatus(status string) ([]models.Fornecedor, error)
	GetByCategoria(categoria string) ([]models.Fornecedor, error)
	Search(query string) ([]models.Fornecedor, error)
	GetStats() (map[string]interface{}, error)
}

// EstadoRepository define operações específicas para estados
type EstadoRepository interface {
	BaseRepository[models.Estado]
	GetBySigla(sigla string) (*models.Estado, error)
	GetByCodigo(codigo int) (*models.Estado, error)
	GetWithRegiao() ([]models.Estado, error)
}

// CidadeRepository define operações específicas para cidades
type CidadeRepository interface {
	BaseRepository[models.Cidade]
	GetByEstado(estadoID uint) ([]models.Cidade, error)
	GetByCodigoIBGE(codigo string) (*models.Cidade, error)
	GetByEstadoSigla(sigla string) ([]models.Cidade, error)
}

// CacheMetadataRepository define operações para cache metadata
type CacheMetadataRepository interface {
	BaseRepository[models.CacheMetadata]
	GetByTipo(tipo string) (*models.CacheMetadata, error)
	UpdateSync(tipo string) error
}

// ============================================
// REPOSITORY MANAGER
// ============================================

// RepositoryManager agrupa todos os repositories
type RepositoryManager struct {
	User          UserRepository
	Cliente       ClienteRepository
	Produto       ProdutoRepository
	Fornecedor    FornecedorRepository
	Estado        EstadoRepository
	Cidade        CidadeRepository
	CacheMetadata CacheMetadataRepository
}

// NewRepositoryManager cria uma nova instância do manager
func NewRepositoryManager(db *gorm.DB) *RepositoryManager {
	return &RepositoryManager{
		User:          NewUserRepository(db),
		Cliente:       NewClienteRepository(db),
		Produto:       NewProdutoRepository(db),
		Fornecedor:    NewFornecedorRepository(db),
		Estado:        NewEstadoRepository(db),
		Cidade:        NewCidadeRepository(db),
		CacheMetadata: NewCacheMetadataRepository(db),
	}
}
