// ============================================
// API - USUÁRIOS
// ============================================

import { apiClient } from "./client"
import type {
  Usuario,
  CreateUsuarioDTO,
  UpdateUsuarioDTO,
  UpdateSenhaDTO,
  UsuarioStats,
  QueryParams,
} from "@/types"

const ENDPOINT = "/usuarios"

export const usuariosApi = {
  /**
   * Lista todos os usuários com filtros opcionais
   */
  getAll: async (params?: QueryParams): Promise<Usuario[]> => {
    return apiClient.get<Usuario[]>(ENDPOINT, params)
  },

  /**
   * Busca um usuário por ID
   */
  getById: async (id: number): Promise<Usuario> => {
    return apiClient.get<Usuario>(`${ENDPOINT}/${id}`)
  },

  /**
   * Cria um novo usuário
   */
  create: async (data: CreateUsuarioDTO): Promise<Usuario> => {
    return apiClient.post<Usuario>(ENDPOINT, data)
  },

  /**
   * Atualiza um usuário existente
   */
  update: async (id: number, data: UpdateUsuarioDTO): Promise<Usuario> => {
    return apiClient.put<Usuario>(`${ENDPOINT}/${id}`, data)
  },

  /**
   * Remove um usuário (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`${ENDPOINT}/${id}`)
  },

  /**
   * Atualiza a senha de um usuário
   */
  updateSenha: async (id: number, data: UpdateSenhaDTO): Promise<void> => {
    return apiClient.put<void>(`${ENDPOINT}/${id}/senha`, data)
  },

  /**
   * Obtém estatísticas dos usuários
   */
  getStats: async (): Promise<UsuarioStats> => {
    return apiClient.get<UsuarioStats>(`${ENDPOINT}/stats`)
  },
}

