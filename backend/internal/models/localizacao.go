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
	RegiaoID  uint      `json:"regiaoId" gorm:"column:regiaoId"`
	Regiao    Regiao    `json:"regiao" gorm:"foreignKey:RegiaoID"`
	Cidades   []Cidade  `json:"cidades,omitempty" gorm:"foreignKey:EstadoID"`
	CreatedAt time.Time `json:"createdAt" gorm:"column:createdAt"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"column:updatedAt"`
}

// Regiao - Cache permanente das regiões brasileiras
type Regiao struct {
	ID        uint      `json:"id" gorm:"primaryKey;column:id"`
	Codigo    int       `json:"codigo" gorm:"uniqueIndex;not null;column:codigo"` // 1=Norte, 2=Nordeste, etc
	Sigla     string    `json:"sigla" gorm:"size:2;uniqueIndex;not null;column:sigla"`
	Nome      string    `json:"nome" gorm:"size:50;not null;column:nome"`
	Estados   []Estado  `json:"estados,omitempty" gorm:"foreignKey:RegiaoID"`
	CreatedAt time.Time `json:"createdAt" gorm:"column:createdAt"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"column:updatedAt"`
}

// Cidade - Cache permanente das cidades brasileiras
type Cidade struct {
	ID          uint      `json:"id" gorm:"primaryKey;column:id"`
	CodigoIBGE  string    `json:"codigoIbge" gorm:"size:10;uniqueIndex;not null;column:codigoIbge"`
	Nome        string    `json:"nome" gorm:"size:100;not null;column:nome"`
	EstadoID    uint      `json:"estadoId" gorm:"column:estadoId"`
	Estado      Estado    `json:"estado" gorm:"foreignKey:EstadoID"`
	CreatedAt   time.Time `json:"createdAt" gorm:"column:createdAt"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"column:updatedAt"`
}

// CacheMetadata - Controla quando foi a última atualização dos dados
type CacheMetadata struct {
	ID            uint      `json:"id" gorm:"primaryKey;column:id"`
	Tipo          string    `json:"tipo" gorm:"size:50;uniqueIndex;not null;column:tipo"` // "estados", "cidades"
	UltimaSync    time.Time `json:"ultimaSync" gorm:"column:ultimaSync"`
	VersaoAPI     string    `json:"versaoApi" gorm:"size:20;column:versaoApi"`
	TotalRegistros int      `json:"totalRegistros" gorm:"column:totalRegistros"`
	CreatedAt     time.Time `json:"createdAt" gorm:"column:createdAt"`
	UpdatedAt     time.Time `json:"updatedAt" gorm:"column:updatedAt"`
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
