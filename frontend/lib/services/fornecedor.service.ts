/**
 * Fornecedor Service
 * Serviço para gerenciar fornecedores
 */

import { httpClient } from '../http-client'
import type { 
  Fornecedor, 
  CreateFornecedorRequest, 
  UpdateFornecedorRequest,
  FornecedorStats,
  FornecedorFilters,
  FornecedorSearchParams
} from '@/types/fornecedor'

export const fornecedorService = {
  /**
   * Lista todos os fornecedores
   */
  async getAll(): Promise<Fornecedor[]> {
    return httpClient.get<Fornecedor[]>('/fornecedores')
  },

  /**
   * Busca fornecedor por ID
   */
  async getById(id: number): Promise<Fornecedor> {
    return httpClient.get<Fornecedor>(`/fornecedores/${id}`)
  },

  /**
   * Cria novo fornecedor
   */
  async create(data: CreateFornecedorRequest): Promise<Fornecedor> {
    return httpClient.post<Fornecedor>('/fornecedores', data)
  },

  /**
   * Atualiza fornecedor
   */
  async update(id: number, data: UpdateFornecedorRequest): Promise<Fornecedor> {
    return httpClient.put<Fornecedor>(`/fornecedores/${id}`, data)
  },

  /**
   * Deleta fornecedor (soft delete)
   */
  async delete(id: number): Promise<void> {
    return httpClient.delete(`/fornecedores/${id}`)
  },

  /**
   * Busca fornecedores por status
   */
  async getByStatus(status: string): Promise<Fornecedor[]> {
    return httpClient.get<Fornecedor[]>(`/fornecedores/status?status=${status}`)
  },

  /**
   * Busca fornecedores por categoria
   */
  async getByCategoria(categoria: string): Promise<Fornecedor[]> {
    return httpClient.get<Fornecedor[]>(`/fornecedores/categoria?categoria=${encodeURIComponent(categoria)}`)
  },

  /**
   * Busca fornecedores (search)
   */
  async search(query: string): Promise<Fornecedor[]> {
    return httpClient.get<Fornecedor[]>(`/fornecedores/search?q=${encodeURIComponent(query)}`)
  },

  /**
   * Busca avançada com filtros
   */
  async searchAdvanced(params: FornecedorSearchParams): Promise<{
    data: Fornecedor[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const searchParams = new URLSearchParams()
    
    if (params.query) searchParams.append('q', params.query)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)
    
    // Filtros
    if (params.filters) {
      if (params.filters.status) {
        params.filters.status.forEach(status => searchParams.append('status[]', status))
      }
      if (params.filters.categoria) {
        params.filters.categoria.forEach(cat => searchParams.append('categoria[]', cat))
      }
      if (params.filters.tipoPessoa) {
        params.filters.tipoPessoa.forEach(tipo => searchParams.append('tipoPessoa[]', tipo))
      }
      if (params.filters.temContrato !== undefined) {
        searchParams.append('temContrato', params.filters.temContrato.toString())
      }
      if (params.filters.temDadosBancarios !== undefined) {
        searchParams.append('temDadosBancarios', params.filters.temDadosBancarios.toString())
      }
    }

    return httpClient.get(`/fornecedores/search/advanced?${searchParams.toString()}`)
  },

  /**
   * Obtém estatísticas de fornecedores
   */
  async getStats(): Promise<FornecedorStats> {
    return httpClient.get<FornecedorStats>('/fornecedores/stats')
  },

  /**
   * Busca fornecedor por CNPJ/CPF
   */
  async getByCNPJCPF(cnpjCpf: string): Promise<Fornecedor | null> {
    try {
      return await httpClient.get<Fornecedor>(`/fornecedores/cnpj-cpf/${encodeURIComponent(cnpjCpf)}`)
    } catch (error: any) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Ativa fornecedor
   */
  async activate(id: number): Promise<Fornecedor> {
    return httpClient.patch<Fornecedor>(`/fornecedores/${id}/activate`)
  },

  /**
   * Inativa fornecedor
   */
  async deactivate(id: number): Promise<Fornecedor> {
    return httpClient.patch<Fornecedor>(`/fornecedores/${id}/deactivate`)
  },

  /**
   * Bloqueia fornecedor
   */
  async block(id: number): Promise<Fornecedor> {
    return httpClient.patch<Fornecedor>(`/fornecedores/${id}/block`)
  },

  /**
   * Desbloqueia fornecedor
   */
  async unblock(id: number): Promise<Fornecedor> {
    return httpClient.patch<Fornecedor>(`/fornecedores/${id}/unblock`)
  },

  /**
   * Ativação em massa
   */
  async bulkActivate(ids: number[]): Promise<void> {
    return httpClient.patch('/fornecedores/bulk/activate', { ids })
  },

  /**
   * Inativação em massa
   */
  async bulkDeactivate(ids: number[]): Promise<void> {
    return httpClient.patch('/fornecedores/bulk/deactivate', { ids })
  },

  /**
   * Bloqueio em massa
   */
  async bulkBlock(ids: number[]): Promise<void> {
    return httpClient.patch('/fornecedores/bulk/block', { ids })
  },

  /**
   * Exclusão em massa
   */
  async bulkDelete(ids: number[]): Promise<void> {
    return httpClient.delete('/fornecedores/bulk', { data: { ids } })
  },

  /**
   * Obtém categorias disponíveis
   */
  async getCategorias(): Promise<string[]> {
    return httpClient.get<string[]>('/fornecedores/categorias')
  },

  /**
   * Obtém fornecedores com contratos ativos
   */
  async getComContratos(): Promise<Fornecedor[]> {
    return httpClient.get<Fornecedor[]>('/fornecedores/com-contratos')
  },

  /**
   * Obtém fornecedores com dados bancários
   */
  async getComDadosBancarios(): Promise<Fornecedor[]> {
    return httpClient.get<Fornecedor[]>('/fornecedores/com-dados-bancarios')
  },

  /**
   * Obtém histórico de compras do fornecedor
   */
  async getHistoricoCompras(id: number): Promise<any[]> {
    return httpClient.get<any[]>(`/fornecedores/${id}/historico-compras`)
  },

  /**
   * Atualiza dados bancários
   */
  async updateDadosBancarios(id: number, dadosBancarios: {
    banco?: string
    agencia?: string
    conta?: string
    tipoConta?: string
    pix?: string
  }): Promise<Fornecedor> {
    return httpClient.patch<Fornecedor>(`/fornecedores/${id}/dados-bancarios`, dadosBancarios)
  },

  /**
   * Atualiza dados comerciais
   */
  async updateDadosComerciais(id: number, dadosComerciais: {
    prazoPagamento?: number
    limiteCompra?: number
    descontoNegociado?: number
    freteMinimo?: number
    pedidoMinimo?: number
    prazoEntrega?: number
  }): Promise<Fornecedor> {
    return httpClient.patch<Fornecedor>(`/fornecedores/${id}/dados-comerciais`, dadosComerciais)
  },

  /**
   * Agenda próximo contato
   */
  async agendarProximoContato(id: number, data: string): Promise<Fornecedor> {
    return httpClient.patch<Fornecedor>(`/fornecedores/${id}/agendar-contato`, { proximoContato: data })
  },

  /**
   * Exporta fornecedores para Excel
   */
  async exportToExcel(ids?: number[]): Promise<Blob> {
    const params = ids ? { ids } : {}
    return httpClient.post('/fornecedores/export/excel', params, {
      responseType: 'blob'
    })
  }
}
