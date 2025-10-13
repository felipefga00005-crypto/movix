// ============================================
// API - PRODUTOS
// ============================================

import { apiClient } from "./client"
import type {
  Produto,
  CreateProdutoDTO,
  UpdateProdutoDTO,
  UpdateEstoqueDTO,
  ProdutoStats,
  QueryParams,
} from "@/types"

const ENDPOINT = "/produtos"

export const produtosApi = {
  /**
   * Lista todos os produtos com filtros opcionais
   */
  getAll: async (params?: QueryParams): Promise<Produto[]> => {
    return apiClient.get<Produto[]>(ENDPOINT, params)
  },

  /**
   * Busca um produto por ID
   */
  getById: async (id: number): Promise<Produto> => {
    return apiClient.get<Produto>(`${ENDPOINT}/${id}`)
  },

  /**
   * Cria um novo produto
   */
  create: async (data: CreateProdutoDTO): Promise<Produto> => {
    return apiClient.post<Produto>(ENDPOINT, data)
  },

  /**
   * Atualiza um produto existente
   */
  update: async (id: number, data: UpdateProdutoDTO): Promise<Produto> => {
    console.log('produtosApi.update - Iniciando requisição PUT para ID:', id)
    console.log('produtosApi.update - URL:', `${ENDPOINT}/${id}`)
    console.log('produtosApi.update - Dados enviados:', data)

    try {
      const result = await apiClient.put<Produto>(`${ENDPOINT}/${id}`, data)
      console.log('produtosApi.update - Resposta recebida:', result)
      return result
    } catch (error) {
      console.error('produtosApi.update - Erro na requisição:', error)
      throw error
    }
  },

  /**
   * Remove um produto (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`${ENDPOINT}/${id}`)
  },

  /**
   * Atualiza o estoque de um produto
   */
  updateEstoque: async (id: number, data: UpdateEstoqueDTO): Promise<Produto> => {
    return apiClient.put<Produto>(`${ENDPOINT}/${id}/estoque`, data)
  },

  /**
   * Lista produtos com estoque baixo
   */
  getEstoqueBaixo: async (): Promise<Produto[]> => {
    return apiClient.get<Produto[]>(`${ENDPOINT}/estoque-baixo`)
  },

  /**
   * Obtém estatísticas dos produtos
   */
  getStats: async (): Promise<ProdutoStats> => {
    return apiClient.get<ProdutoStats>(`${ENDPOINT}/stats`)
  },

  /**
   * Busca produtos por categoria
   */
  getByCategoria: async (categoriaId: number): Promise<Produto[]> => {
    return apiClient.get<Produto[]>(`${ENDPOINT}/categoria/${categoriaId}`)
  },

  /**
   * Busca produtos por fornecedor
   */
  getByFornecedor: async (fornecedorId: number): Promise<Produto[]> => {
    return apiClient.get<Produto[]>(`${ENDPOINT}/fornecedor/${fornecedorId}`)
  },

  /**
   * Busca produtos ativos
   */
  getAtivos: async (): Promise<Produto[]> => {
    return apiClient.get<Produto[]>(`${ENDPOINT}/ativos`)
  },

  /**
   * Busca produtos por código de barras
   */
  getByCodigoBarras: async (codigoBarras: string): Promise<Produto | null> => {
    return apiClient.get<Produto>(`${ENDPOINT}/codigo-barras/${codigoBarras}`)
  },

  /**
   * Busca produtos com preço em uma faixa
   */
  getByFaixaPreco: async (precoMin: number, precoMax: number): Promise<Produto[]> => {
    return apiClient.get<Produto[]>(`${ENDPOINT}/preco`, { precoMin, precoMax })
  },
}

