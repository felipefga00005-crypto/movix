"use client"

// ============================================
// HOOK - useClientes
// ============================================

import { useState, useEffect, useCallback } from "react"
import { clientesApi } from "@/lib/api"
import type {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
  ClienteStats,
  QueryParams,
} from "@/types"

interface UseClientesOptions {
  autoFetch?: boolean
  initialParams?: QueryParams
}

export function useClientes(options: UseClientesOptions = {}) {
  const { autoFetch = true, initialParams } = options

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [stats, setStats] = useState<ClienteStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar todos os clientes
  const fetchClientes = useCallback(async (params?: QueryParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await clientesApi.getAll(params)
      setClientes(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar clientes"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const data = await clientesApi.getStats()
      setStats(data)
      return data
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err)
      throw err
    }
  }, [])

  // Buscar cliente por ID
  const getCliente = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await clientesApi.getById(id)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar cliente"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar cliente
  const createCliente = useCallback(async (data: CreateClienteDTO) => {
    setLoading(true)
    setError(null)
    try {
      const newCliente = await clientesApi.create(data)
      setClientes((prev) => [...prev, newCliente])
      return newCliente
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar cliente"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar cliente
  const updateCliente = useCallback(async (id: number, data: UpdateClienteDTO) => {
    console.log('useClientes.updateCliente - Iniciando update para ID:', id)
    console.log('useClientes.updateCliente - Dados recebidos:', data)

    setLoading(true)
    setError(null)
    try {
      console.log('useClientes.updateCliente - Chamando clientesApi.update')
      const updatedCliente = await clientesApi.update(id, data)
      console.log('useClientes.updateCliente - Cliente atualizado:', updatedCliente)

      setClientes((prev) =>
        prev.map((cliente) => (cliente.id === id ? updatedCliente : cliente))
      )
      return updatedCliente
    } catch (err) {
      console.error('useClientes.updateCliente - Erro capturado:', err)
      const message = err instanceof Error ? err.message : "Erro ao atualizar cliente"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Deletar cliente
  const deleteCliente = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await clientesApi.delete(id)
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao deletar cliente"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Recarregar dados
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchClientes(initialParams),
      fetchStats(),
    ])
  }, [fetchClientes, fetchStats, initialParams])

  // Auto-fetch ao montar
  useEffect(() => {
    if (autoFetch) {
      refresh()
    }
  }, [autoFetch]) // Removido refresh das dependências para evitar loop

  return {
    clientes,
    stats,
    loading,
    error,
    fetchClientes,
    fetchStats,
    getCliente,
    createCliente,
    updateCliente,
    deleteCliente,
    refresh,
  }
}

