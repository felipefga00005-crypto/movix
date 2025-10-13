package models

import (
	"time"
	"gorm.io/gorm"
)

// ============================================
// MODELOS PARA CACHE DE LOCALIZAÇÃO
// ============================================

// Estado - Cache permanente dos estados brasileiros
type Estado struct {
	ID        uint      `json:"id" gorm:"primaryKey;column:id"`
	Codigo    int       `json:"codigo" gorm:"uniqueIndex;not null;column:codigo"` // Código IBGE
	Sigla     string    `json:"sigla" gorm:"size:2;uniqueIndex;not null;column:sigla"`
	Nome      string    `json:"nome" gorm:"size:100;not null;column:nome"`
	RegiaoID  uint      `json:"regiao_id" gorm:"column:regiao_id"`
	Regiao    Regiao    `json:"regiao" gorm:"foreignKey:RegiaoID"`
	Cidades   []Cidade  `json:"cidades,omitempty" gorm:"foreignKey:EstadoID"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at"`
}

// Regiao - Cache permanente das regiões brasileiras
type Regiao struct {
	ID        uint      `json:"id" gorm:"primaryKey;column:id"`
	Codigo    int       `json:"codigo" gorm:"uniqueIndex;not null;column:codigo"` // 1=Norte, 2=Nordeste, etc
	Sigla     string    `json:"sigla" gorm:"size:2;uniqueIndex;not null;column:sigla"`
	Nome      string    `json:"nome" gorm:"size:50;not null;column:nome"`
	Estados   []Estado  `json:"estados,omitempty" gorm:"foreignKey:RegiaoID"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at"`
}

// Cidade - Cache permanente das cidades brasileiras
type Cidade struct {
	ID          uint      `json:"id" gorm:"primaryKey;column:id"`
	CodigoIBGE  string    `json:"codigo_ibge" gorm:"size:10;uniqueIndex;not null;column:codigo_ibge"`
	Nome        string    `json:"nome" gorm:"size:100;not null;column:nome"`
	EstadoID    uint      `json:"estado_id" gorm:"column:estado_id"`
	Estado      Estado    `json:"estado" gorm:"foreignKey:EstadoID"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at"`
}

// CacheMetadata - Controla quando foi a última atualização dos dados
type CacheMetadata struct {
	ID            uint      `json:"id" gorm:"primaryKey;column:id"`
	Tipo          string    `json:"tipo" gorm:"size:50;uniqueIndex;not null;column:tipo"` // "estados", "cidades"
	UltimaSync    time.Time `json:"ultima_sync" gorm:"column:ultima_sync"`
	VersaoAPI     string    `json:"versao_api" gorm:"size:20;column:versao_api"`
	TotalRegistros int      `json:"total_registros" gorm:"column:total_registros"`
	CreatedAt     time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"column:updated_at"`
}

// ============================================
// MÉTODOS DO MODELO
// ============================================

// TableName especifica o nome da tabela para Estado
func (Estado) TableName() string {
	return "estados"
}

// TableName especifica o nome da tabela para Regiao
func (Regiao) TableName() string {
	return "regioes"
}

// TableName especifica o nome da tabela para Cidade
func (Cidade) TableName() string {
	return "cidades"
}

// TableName especifica o nome da tabela para CacheMetadata
func (CacheMetadata) TableName() string {
	return "cache_metadata"
}

// ============================================
// ESTRUTURAS DE RESPOSTA PARA API
// ============================================

// EstadoResponse - Formato de resposta da API
type EstadoResponse struct {
	ID     int    `json:"id"`
	Sigla  string `json:"sigla"`
	Nome   string `json:"nome"`
	Regiao struct {
		ID    int    `json:"id"`
		Sigla string `json:"sigla"`
		Nome  string `json:"nome"`
	} `json:"regiao"`
}

// CidadeResponse - Formato de resposta da API
type CidadeResponse struct {
	Nome       string `json:"nome"`
	CodigoIBGE string `json:"codigo_ibge"`
}

// ============================================
// MÉTODOS DE CONVERSÃO
// ============================================

// ToResponse converte Estado para EstadoResponse
func (e *Estado) ToResponse() EstadoResponse {
	return EstadoResponse{
		ID:    e.Codigo,
		Sigla: e.Sigla,
		Nome:  e.Nome,
		Regiao: struct {
			ID    int    `json:"id"`
			Sigla string `json:"sigla"`
			Nome  string `json:"nome"`
		}{
			ID:    e.Regiao.Codigo,
			Sigla: e.Regiao.Sigla,
			Nome:  e.Regiao.Nome,
		},
	}
}

// ToResponse converte Cidade para CidadeResponse
func (c *Cidade) ToResponse() CidadeResponse {
	return CidadeResponse{
		Nome:       c.Nome,
		CodigoIBGE: c.CodigoIBGE,
	}
}

// ============================================
// HOOKS DO GORM
// ============================================

// BeforeCreate hook para Estado
func (e *Estado) BeforeCreate(tx *gorm.DB) error {
	e.CreatedAt = time.Now()
	e.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate hook para Estado
func (e *Estado) BeforeUpdate(tx *gorm.DB) error {
	e.UpdatedAt = time.Now()
	return nil
}

// BeforeCreate hook para Regiao
func (r *Regiao) BeforeCreate(tx *gorm.DB) error {
	r.CreatedAt = time.Now()
	r.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate hook para Regiao
func (r *Regiao) BeforeUpdate(tx *gorm.DB) error {
	r.UpdatedAt = time.Now()
	return nil
}

// BeforeCreate hook para Cidade
func (c *Cidade) BeforeCreate(tx *gorm.DB) error {
	c.CreatedAt = time.Now()
	c.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate hook para Cidade
func (c *Cidade) BeforeUpdate(tx *gorm.DB) error {
	c.UpdatedAt = time.Now()
	return nil
}

// BeforeCreate hook para CacheMetadata
func (cm *CacheMetadata) BeforeCreate(tx *gorm.DB) error {
	cm.CreatedAt = time.Now()
	cm.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate hook para CacheMetadata
func (cm *CacheMetadata) BeforeUpdate(tx *gorm.DB) error {
	cm.UpdatedAt = time.Now()
	return nil
}
