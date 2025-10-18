/**
 * Produto Service
 * Serviço para gerenciar produtos
 */

import { httpClient } from '../http-client'
import type { 
  Produto, 
  CreateProdutoRequest, 
  UpdateProdutoRequest,
  ProdutoStats,
  ProdutoFilters,
  ProdutoSearchParams,
  MovimentacaoEstoque,
  RelatorioProduto
} from '@/types/produto'

export const produtoService = {
  /**
   * Lista todos os produtos
   */
  async getAll(): Promise<Produto[]> {
    return httpClient.get<Produto[]>('/produtos')
  },

  /**
   * Busca produto por ID
   */
  async getById(id: number): Promise<Produto> {
    return httpClient.get<Produto>(`/produtos/${id}`)
  },

  /**
   * Cria novo produto
   */
  async create(data: CreateProdutoRequest): Promise<Produto> {
    return httpClient.post<Produto>('/produtos', data)
  },

  /**
   * Atualiza produto
   */
  async update(id: number, data: UpdateProdutoRequest): Promise<Produto> {
    return httpClient.put<Produto>(`/produtos/${id}`, data)
  },

  /**
   * Deleta produto (soft delete)
   */
  async delete(id: number): Promise<void> {
    return httpClient.delete(`/produtos/${id}`)
  },

  /**
   * Busca produtos por status
   */
  async getByStatus(ativo: boolean): Promise<Produto[]> {
    return httpClient.get<Produto[]>(`/produtos/status?ativo=${ativo}`)
  },

  /**
   * Busca produtos por categoria
   */
  async getByCategoria(categoria: string): Promise<Produto[]> {
    return httpClient.get<Produto[]>(`/produtos/categoria?categoria=${encodeURIComponent(categoria)}`)
  },

  /**
   * Busca produtos por marca
   */
  async getByMarca(marca: string): Promise<Produto[]> {
    return httpClient.get<Produto[]>(`/produtos/marca?marca=${encodeURIComponent(marca)}`)
  },

  /**
   * Busca produtos (search)
   */
  async search(query: string): Promise<Produto[]> {
    return httpClient.get<Produto[]>(`/produtos/search?q=${encodeURIComponent(query)}`)
  },

  /**
   * Busca avançada com filtros
   */
  async searchAdvanced(params: ProdutoSearchParams): Promise<{
    data: Produto[]
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
      if (params.filters.ativo !== undefined) {
        searchParams.append('ativo', params.filters.ativo.toString())
      }
      if (params.filters.categoria) {
        params.filters.categoria.forEach(cat => searchParams.append('categoria[]', cat))
      }
      if (params.filters.marca) {
        params.filters.marca.forEach(marca => searchParams.append('marca[]', marca))
      }
      if (params.filters.fornecedor) {
        params.filters.fornecedor.forEach(forn => searchParams.append('fornecedor[]', forn))
      }
      if (params.filters.promocao !== undefined) {
        searchParams.append('promocao', params.filters.promocao.toString())
      }
      if (params.filters.destaque !== undefined) {
        searchParams.append('destaque', params.filters.destaque.toString())
      }
      if (params.filters.baixoEstoque !== undefined) {
        searchParams.append('baixoEstoque', params.filters.baixoEstoque.toString())
      }
      if (params.filters.semEstoque !== undefined) {
        searchParams.append('semEstoque', params.filters.semEstoque.toString())
      }
      if (params.filters.faixaPreco) {
        if (params.filters.faixaPreco.min !== undefined) {
          searchParams.append('precoMin', params.filters.faixaPreco.min.toString())
        }
        if (params.filters.faixaPreco.max !== undefined) {
          searchParams.append('precoMax', params.filters.faixaPreco.max.toString())
        }
      }
      if (params.filters.faixaEstoque) {
        if (params.filters.faixaEstoque.min !== undefined) {
          searchParams.append('estoqueMin', params.filters.faixaEstoque.min.toString())
        }
        if (params.filters.faixaEstoque.max !== undefined) {
          searchParams.append('estoqueMax', params.filters.faixaEstoque.max.toString())
        }
      }
    }

    return httpClient.get(`/produtos/search/advanced?${searchParams.toString()}`)
  },

  /**
   * Obtém estatísticas de produtos
   */
  async getStats(): Promise<ProdutoStats> {
    return httpClient.get<ProdutoStats>('/produtos/stats')
  },

  /**
   * Busca produto por código
   */
  async getByCodigo(codigo: string): Promise<Produto | null> {
    try {
      return await httpClient.get<Produto>(`/produtos/codigo/${encodeURIComponent(codigo)}`)
    } catch (error: any) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Busca produto por código de barras
   */
  async getByCodigoBarras(codigoBarras: string): Promise<Produto | null> {
    try {
      return await httpClient.get<Produto>(`/produtos/codigo-barras/${encodeURIComponent(codigoBarras)}`)
    } catch (error: any) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Ativa produto
   */
  async activate(id: number): Promise<Produto> {
    return httpClient.patch<Produto>(`/produtos/${id}/activate`)
  },

  /**
   * Inativa produto
   */
  async deactivate(id: number): Promise<Produto> {
    return httpClient.patch<Produto>(`/produtos/${id}/deactivate`)
  },

  /**
   * Marca produto como destaque
   */
  async setDestaque(id: number, destaque: boolean): Promise<Produto> {
    return httpClient.patch<Produto>(`/produtos/${id}/destaque`, { destaque })
  },

  /**
   * Marca produto como promoção
   */
  async setPromocao(id: number, promocao: boolean, precoPromocional?: number): Promise<Produto> {
    return httpClient.patch<Produto>(`/produtos/${id}/promocao`, { promocao, precoPromocional })
  },

  /**
   * Ativação em massa
   */
  async bulkActivate(ids: number[]): Promise<void> {
    return httpClient.patch('/produtos/bulk/activate', { ids })
  },

  /**
   * Inativação em massa
   */
  async bulkDeactivate(ids: number[]): Promise<void> {
    return httpClient.patch('/produtos/bulk/deactivate', { ids })
  },

  /**
   * Exclusão em massa
   */
  async bulkDelete(ids: number[]): Promise<void> {
    return httpClient.delete('/produtos/bulk', { data: { ids } })
  },

  /**
   * Atualização de preços em massa
   */
  async bulkUpdatePrecos(ids: number[], dados: {
    preco?: number
    precoCusto?: number
    precoPromocional?: number
    percentualAumento?: number
    percentualDesconto?: number
  }): Promise<void> {
    return httpClient.patch('/produtos/bulk/precos', { ids, ...dados })
  },

  /**
   * Obtém categorias disponíveis
   */
  async getCategorias(): Promise<string[]> {
    return httpClient.get<string[]>('/produtos/categorias')
  },

  /**
   * Obtém marcas disponíveis
   */
  async getMarcas(): Promise<string[]> {
    return httpClient.get<string[]>('/produtos/marcas')
  },

  /**
   * Obtém fornecedores disponíveis
   */
  async getFornecedores(): Promise<string[]> {
    return httpClient.get<string[]>('/produtos/fornecedores')
  },

  /**
   * Obtém produtos com baixo estoque
   */
  async getBaixoEstoque(): Promise<Produto[]> {
    return httpClient.get<Produto[]>('/produtos/baixo-estoque')
  },

  /**
   * Obtém produtos sem estoque
   */
  async getSemEstoque(): Promise<Produto[]> {
    return httpClient.get<Produto[]>('/produtos/sem-estoque')
  },

  /**
   * Obtém produtos em promoção
   */
  async getEmPromocao(): Promise<Produto[]> {
    return httpClient.get<Produto[]>('/produtos/promocao')
  },

  /**
   * Obtém produtos em destaque
   */
  async getEmDestaque(): Promise<Produto[]> {
    return httpClient.get<Produto[]>('/produtos/destaque')
  },

  /**
   * Atualiza estoque do produto
   */
  async updateEstoque(id: number, dados: {
    quantidade: number
    tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'
    motivo?: string
    documento?: string
    valorUnitario?: number
    observacoes?: string
  }): Promise<Produto> {
    return httpClient.patch<Produto>(`/produtos/${id}/estoque`, dados)
  },

  /**
   * Obtém histórico de movimentações do produto
   */
  async getMovimentacoes(id: number): Promise<MovimentacaoEstoque[]> {
    return httpClient.get<MovimentacaoEstoque[]>(`/produtos/${id}/movimentacoes`)
  },

  /**
   * Atualiza preços do produto
   */
  async updatePrecos(id: number, dados: {
    preco?: number
    precoCusto?: number
    precoPromocional?: number
    margemLucro?: number
    markup?: number
  }): Promise<Produto> {
    return httpClient.patch<Produto>(`/produtos/${id}/precos`, dados)
  },

  /**
   * Calcula margem de lucro
   */
  async calcularMargem(precoCusto: number, precoVenda: number): Promise<{
    margemLucro: number
    markup: number
    lucroUnitario: number
  }> {
    return httpClient.post('/produtos/calcular-margem', { precoCusto, precoVenda })
  },

  /**
   * Gera código automático para produto
   */
  async gerarCodigo(categoria?: string): Promise<string> {
    const params = categoria ? `?categoria=${encodeURIComponent(categoria)}` : ''
    return httpClient.get<string>(`/produtos/gerar-codigo${params}`)
  },

  /**
   * Duplica produto
   */
  async duplicar(id: number, dados?: {
    nome?: string
    codigo?: string
  }): Promise<Produto> {
    return httpClient.post<Produto>(`/produtos/${id}/duplicar`, dados)
  },

  /**
   * Obtém relatório de produtos
   */
  async getRelatorio(filtros?: ProdutoFilters): Promise<RelatorioProduto[]> {
    const searchParams = new URLSearchParams()
    
    if (filtros) {
      if (filtros.ativo !== undefined) searchParams.append('ativo', filtros.ativo.toString())
      if (filtros.categoria) filtros.categoria.forEach(cat => searchParams.append('categoria[]', cat))
      if (filtros.marca) filtros.marca.forEach(marca => searchParams.append('marca[]', marca))
    }

    return httpClient.get<RelatorioProduto[]>(`/produtos/relatorio?${searchParams.toString()}`)
  },

  /**
   * Exporta produtos para Excel
   */
  async exportToExcel(ids?: number[]): Promise<Blob> {
    const params = ids ? { ids } : {}
    return httpClient.post('/produtos/export/excel', params, {
      responseType: 'blob'
    })
  }
}
