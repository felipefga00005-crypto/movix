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
    return apiClient.put<Produto>(`${ENDPOINT}/${id}`, data)
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
}

