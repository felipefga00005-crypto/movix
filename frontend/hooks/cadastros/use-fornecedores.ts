"use client"

// ============================================
// HOOK - useFornecedores
// ============================================

import { useState, useEffect, useCallback } from "react"
import { fornecedoresApi } from "@/lib/api/fornecedores"
import type {
  Fornecedor,
  CreateFornecedorDTO,
  UpdateFornecedorDTO,
  FornecedorStats,
  QueryParams,
} from "@/types"

interface UseFornecedoresOptions {
  autoFetch?: boolean
  initialParams?: QueryParams
}

export function useFornecedores(options: UseFornecedoresOptions = {}) {
  const { autoFetch = true, initialParams } = options

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [stats, setStats] = useState<FornecedorStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar todos os fornecedores
  const fetchFornecedores = useCallback(async (params?: QueryParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fornecedoresApi.getAll(params)
      setFornecedores(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar fornecedores"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const data = await fornecedoresApi.getStats()
      setStats(data)
      return data
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err)
      throw err
    }
  }, [])

  // Buscar fornecedor por ID
  const getFornecedor = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fornecedoresApi.getById(id)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar fornecedor"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar fornecedor
  const createFornecedor = useCallback(async (data: CreateFornecedorDTO) => {
    setLoading(true)
    setError(null)
    try {
      const newFornecedor = await fornecedoresApi.create(data)
      setFornecedores((prev) => [...prev, newFornecedor])
      return newFornecedor
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar fornecedor"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar fornecedor
  const updateFornecedor = useCallback(async (id: number, data: UpdateFornecedorDTO) => {
    setLoading(true)
    setError(null)
    try {
      const updatedFornecedor = await fornecedoresApi.update(id, data)
      setFornecedores((prev) =>
        prev.map((fornecedor) => (fornecedor.id === id ? updatedFornecedor : fornecedor))
      )
      return updatedFornecedor
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar fornecedor"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Deletar fornecedor
  const deleteFornecedor = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await fornecedoresApi.delete(id)
      setFornecedores((prev) => prev.filter((fornecedor) => fornecedor.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao deletar fornecedor"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar fornecedores por categoria
  const getFornecedoresByCategoria = useCallback(async (categoria: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fornecedoresApi.getByCategoria(categoria)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar fornecedores por categoria"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar fornecedores ativos
  const getFornecedoresAtivos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fornecedoresApi.getAtivos()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar fornecedores ativos"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Recarregar dados
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchFornecedores(initialParams),
      fetchStats(),
    ])
  }, [fetchFornecedores, fetchStats, initialParams])

  // Auto-fetch ao montar
  useEffect(() => {
    if (autoFetch) {
      refresh()
    }
  }, [autoFetch])

  return {
    fornecedores,
    stats,
    loading,
    error,
    fetchFornecedores,
    fetchStats,
    getFornecedor,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    getFornecedoresByCategoria,
    getFornecedoresAtivos,
    refresh,
  }
}

