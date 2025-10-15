/**
 * Cliente Service
 * Serviço para gerenciar clientes
 */

import { httpClient } from '../http-client'
import type { Cliente, CreateClienteRequest, ClienteStats } from '@/types/cliente'

export const clienteService = {
  /**
   * Lista todos os clientes
   */
  async getAll(): Promise<Cliente[]> {
    return httpClient.get<Cliente[]>('/clientes')
  },

  /**
   * Busca cliente por ID
   */
  async getById(id: number): Promise<Cliente> {
    return httpClient.get<Cliente>(`/clientes/${id}`)
  },

  /**
   * Cria novo cliente
   */
  async create(data: CreateClienteRequest): Promise<Cliente> {
    return httpClient.post<Cliente>('/clientes', data)
  },

  /**
   * Atualiza cliente
   */
  async update(id: number, data: Partial<CreateClienteRequest>): Promise<Cliente> {
    return httpClient.put<Cliente>(`/clientes/${id}`, data)
  },

  /**
   * Deleta cliente
   */
  async delete(id: number): Promise<void> {
    return httpClient.delete(`/clientes/${id}`)
  },

  /**
   * Busca clientes por status
   */
  async getByStatus(status: string): Promise<Cliente[]> {
    return httpClient.get<Cliente[]>(`/clientes/status?status=${status}`)
  },

  /**
   * Busca clientes (search)
   */
  async search(query: string): Promise<Cliente[]> {
    return httpClient.get<Cliente[]>(`/clientes/search?q=${encodeURIComponent(query)}`)
  },

  /**
   * Obtém estatísticas de clientes
   */
  async getStats(): Promise<ClienteStats> {
    return httpClient.get<ClienteStats>('/clientes/stats')
  },
}

