package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/movix/backend/internal/models"
	"gorm.io/gorm"
)

// ============================================
// SERVIÇO DE CACHE INTELIGENTE
// ============================================

type CacheService struct {
	db         *gorm.DB
	httpClient *http.Client
}

func NewCacheService(db *gorm.DB) *CacheService {
	return &CacheService{
		db: db,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ============================================
// CONSTANTES
// ============================================

const (
	CACHE_ESTADOS = "estados"
	CACHE_CIDADES = "cidades"
	
	// Tempo para considerar cache expirado (30 dias)
	CACHE_EXPIRY_DAYS = 30
	
	// URLs das APIs externas
	URL_ESTADOS = "https://brasilapi.com.br/api/ibge/uf/v1"
	URL_CIDADES = "https://brasilapi.com.br/api/ibge/municipios/v1"
)

// ============================================
// ESTRUTURAS DA API EXTERNA
// ============================================

type EstadoAPIResponse struct {
	ID     int    `json:"id"`
	Sigla  string `json:"sigla"`
	Nome   string `json:"nome"`
	Regiao struct {
		ID    int    `json:"id"`
		Sigla string `json:"sigla"`
		Nome  string `json:"nome"`
	} `json:"regiao"`
}

type CidadeAPIResponse struct {
	Nome       string `json:"nome"`
	CodigoIBGE string `json:"codigo_ibge"`
}

// ============================================
// MÉTODOS PRINCIPAIS
// ============================================

// GetEstados retorna estados do cache ou busca da API se necessário
func (cs *CacheService) GetEstados() ([]models.EstadoResponse, error) {
	// Verifica se precisa atualizar o cache
	needsUpdate, err := cs.needsCacheUpdate(CACHE_ESTADOS)
	if err != nil {
		return nil, err
	}

	if needsUpdate {
		if err := cs.syncEstados(); err != nil {
			// Se falhar a sincronização, tenta usar cache existente
			fmt.Printf("Erro ao sincronizar estados: %v. Usando cache existente.\n", err)
		}
	}

	// Busca do cache local
	var estados []models.Estado
	err = cs.db.Preload("Regiao").Find(&estados).Error
	if err != nil {
		return nil, err
	}

	// Converte para formato de resposta
	response := make([]models.EstadoResponse, len(estados))
	for i, estado := range estados {
		response[i] = estado.ToResponse()
	}

	return response, nil
}

// GetCidadesPorEstado retorna cidades do cache ou busca da API se necessário
func (cs *CacheService) GetCidadesPorEstado(uf string) ([]models.CidadeResponse, error) {
	// Busca o estado
	var estado models.Estado
	err := cs.db.Where("sigla = ?", uf).First(&estado).Error
	if err != nil {
		return nil, fmt.Errorf("estado não encontrado: %s", uf)
	}

	// Verifica se precisa atualizar o cache de cidades
	needsUpdate, err := cs.needsCacheUpdate(CACHE_CIDADES)
	if err != nil {
		return nil, err
	}

	if needsUpdate {
		if err := cs.syncTodasCidades(); err != nil {
			fmt.Printf("Erro ao sincronizar cidades: %v. Usando cache existente.\n", err)
		}
	}

	// Busca cidades do estado no cache
	var cidades []models.Cidade
	err = cs.db.Where(`"estadoId" = ?`, estado.ID).Find(&cidades).Error
	if err != nil {
		return nil, err
	}

	// Se não tem cidades no cache, busca da API
	if len(cidades) == 0 {
		return cs.fetchCidadesFromAPI(uf)
	}

	// Converte para formato de resposta
	response := make([]models.CidadeResponse, len(cidades))
	for i, cidade := range cidades {
		response[i] = cidade.ToResponse()
	}

	return response, nil
}

// ============================================
// MÉTODOS DE SINCRONIZAÇÃO
// ============================================

// syncEstados sincroniza estados da API externa
func (cs *CacheService) syncEstados() error {
	fmt.Println("🔄 Sincronizando estados da API externa...")

	// Busca da API
	resp, err := cs.httpClient.Get(URL_ESTADOS)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("erro na API: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var estadosAPI []EstadoAPIResponse
	if err := json.Unmarshal(body, &estadosAPI); err != nil {
		return err
	}

	// Inicia transação
	tx := cs.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Primeiro, sincroniza regiões
	regioes := make(map[int]*models.Regiao)
	for _, estadoAPI := range estadosAPI {
		if _, exists := regioes[estadoAPI.Regiao.ID]; !exists {
			regiao := &models.Regiao{
				Codigo: estadoAPI.Regiao.ID,
				Sigla:  estadoAPI.Regiao.Sigla,
				Nome:   estadoAPI.Regiao.Nome,
			}

			// Upsert da região
			err := tx.Where("codigo = ?", regiao.Codigo).FirstOrCreate(regiao).Error
			if err != nil {
				tx.Rollback()
				return err
			}

			regioes[estadoAPI.Regiao.ID] = regiao
		}
	}

	// Depois, sincroniza estados
	for _, estadoAPI := range estadosAPI {
		regiao := regioes[estadoAPI.Regiao.ID]

		estado := &models.Estado{
			Codigo:   estadoAPI.ID,
			Sigla:    estadoAPI.Sigla,
			Nome:     estadoAPI.Nome,
			RegiaoID: regiao.ID,
		}

		// Upsert do estado
		err := tx.Where("codigo = ?", estado.Codigo).FirstOrCreate(estado).Error
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	// Atualiza metadata do cache
	metadata := &models.CacheMetadata{
		Tipo:           CACHE_ESTADOS,
		UltimaSync:     time.Now(),
		VersaoAPI:      "v1",
		TotalRegistros: len(estadosAPI),
	}

	err = tx.Where("tipo = ?", CACHE_ESTADOS).FirstOrCreate(metadata).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	// Atualiza os campos
	metadata.UltimaSync = time.Now()
	metadata.TotalRegistros = len(estadosAPI)
	err = tx.Save(metadata).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	fmt.Printf("✅ Estados sincronizados: %d registros\n", len(estadosAPI))
	return nil
}

// syncTodasCidades sincroniza todas as cidades (processo pesado)
func (cs *CacheService) syncTodasCidades() error {
	fmt.Println("🔄 Sincronizando cidades da API externa...")

	// Busca todos os estados
	var estados []models.Estado
	err := cs.db.Find(&estados).Error
	if err != nil {
		return err
	}

	totalCidades := 0

	// Para cada estado, busca suas cidades
	for _, estado := range estados {
		cidades, err := cs.fetchCidadesFromAPI(estado.Sigla)
		if err != nil {
			fmt.Printf("Erro ao buscar cidades de %s: %v\n", estado.Sigla, err)
			continue
		}

		// Salva no banco
		for _, cidadeResp := range cidades {
			cidade := &models.Cidade{
				CodigoIBGE: cidadeResp.CodigoIBGE,
				Nome:       cidadeResp.Nome,
				EstadoID:   estado.ID,
			}

			// Upsert da cidade
			err := cs.db.Where("codigo_ibge = ?", cidade.CodigoIBGE).FirstOrCreate(cidade).Error
			if err != nil {
				fmt.Printf("Erro ao salvar cidade %s: %v\n", cidade.Nome, err)
				continue
			}
		}

		totalCidades += len(cidades)
		fmt.Printf("✅ %s: %d cidades\n", estado.Sigla, len(cidades))

		// Pequena pausa para não sobrecarregar a API
		time.Sleep(100 * time.Millisecond)
	}

	// Atualiza metadata do cache
	metadata := &models.CacheMetadata{
		Tipo:           CACHE_CIDADES,
		UltimaSync:     time.Now(),
		VersaoAPI:      "v1",
		TotalRegistros: totalCidades,
	}

	err = cs.db.Where("tipo = ?", CACHE_CIDADES).FirstOrCreate(metadata).Error
	if err == nil {
		metadata.UltimaSync = time.Now()
		metadata.TotalRegistros = totalCidades
		cs.db.Save(metadata)
	}

	fmt.Printf("✅ Total de cidades sincronizadas: %d\n", totalCidades)
	return nil
}

// ============================================
// MÉTODOS AUXILIARES
// ============================================

// needsCacheUpdate verifica se o cache precisa ser atualizado
func (cs *CacheService) needsCacheUpdate(tipo string) (bool, error) {
	var metadata models.CacheMetadata
	err := cs.db.Where("tipo = ?", tipo).First(&metadata).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Não existe cache, precisa criar
			return true, nil
		}
		return false, err
	}

	// Verifica se o cache expirou
	expiry := metadata.UltimaSync.Add(CACHE_EXPIRY_DAYS * 24 * time.Hour)
	return time.Now().After(expiry), nil
}

// fetchCidadesFromAPI busca cidades de um estado da API externa
func (cs *CacheService) fetchCidadesFromAPI(uf string) ([]models.CidadeResponse, error) {
	url := fmt.Sprintf("%s/%s", URL_CIDADES, uf)

	resp, err := cs.httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("erro na API: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var cidadesAPI []CidadeAPIResponse
	if err := json.Unmarshal(body, &cidadesAPI); err != nil {
		return nil, err
	}

	// Converte para formato de resposta
	response := make([]models.CidadeResponse, len(cidadesAPI))
	for i, cidade := range cidadesAPI {
		response[i] = models.CidadeResponse{
			Nome:       cidade.Nome,
			CodigoIBGE: cidade.CodigoIBGE,
		}
	}

	return response, nil
}

// ForceSync força a sincronização de todos os dados
func (cs *CacheService) ForceSync() error {
	fmt.Println("🔄 Forçando sincronização completa...")

	if err := cs.syncEstados(); err != nil {
		return fmt.Errorf("erro ao sincronizar estados: %v", err)
	}

	if err := cs.syncTodasCidades(); err != nil {
		return fmt.Errorf("erro ao sincronizar cidades: %v", err)
	}

	fmt.Println("✅ Sincronização completa finalizada!")
	return nil
}
