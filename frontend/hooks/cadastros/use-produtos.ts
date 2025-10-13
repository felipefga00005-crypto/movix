"use client"

// ============================================
// HOOK - useProdutos
// ============================================

import { useState, useEffect, useCallback } from "react"
import { produtosApi } from "@/lib/api"
import type {
  Produto,
  CreateProdutoDTO,
  UpdateProdutoDTO,
  UpdateEstoqueDTO,
  ProdutoStats,
  QueryParams,
} from "@/types"

interface UseProdutosOptions {
  autoFetch?: boolean
  initialParams?: QueryParams
}

export function useProdutos(options: UseProdutosOptions = {}) {
  const { autoFetch = true, initialParams } = options

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [stats, setStats] = useState<ProdutoStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar todos os produtos
  const fetchProdutos = useCallback(async (params?: QueryParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await produtosApi.getAll(params)
      setProdutos(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar produtos"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const data = await produtosApi.getStats()
      setStats(data)
      return data
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err)
      throw err
    }
  }, [])

  // Buscar produto por ID
  const getProduto = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await produtosApi.getById(id)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar produto"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar produto
  const createProduto = useCallback(async (data: CreateProdutoDTO) => {
    setLoading(true)
    setError(null)
    try {
      const newProduto = await produtosApi.create(data)
      setProdutos((prev) => [...prev, newProduto])
      return newProduto
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar produto"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar produto
  const updateProduto = useCallback(async (id: number, data: UpdateProdutoDTO) => {
    setLoading(true)
    setError(null)
    try {
      const updatedProduto = await produtosApi.update(id, data)
      setProdutos((prev) =>
        prev.map((produto) => (produto.id === id ? updatedProduto : produto))
      )
      return updatedProduto
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar produto"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Deletar produto
  const deleteProduto = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await produtosApi.delete(id)
      setProdutos((prev) => prev.filter((produto) => produto.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao deletar produto"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar estoque
  const updateEstoque = useCallback(async (id: number, data: UpdateEstoqueDTO) => {
    setLoading(true)
    setError(null)
    try {
      const updatedProduto = await produtosApi.updateEstoque(id, data)
      setProdutos((prev) =>
        prev.map((produto) => (produto.id === id ? updatedProduto : produto))
      )
      return updatedProduto
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar estoque"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar produtos com estoque baixo
  const fetchEstoqueBaixo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await produtosApi.getEstoqueBaixo()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar produtos com estoque baixo"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Recarregar dados
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchProdutos(initialParams),
      fetchStats(),
    ])
  }, [fetchProdutos, fetchStats, initialParams])

  // Auto-fetch ao montar
  useEffect(() => {
    if (autoFetch) {
      refresh()
    }
  }, [autoFetch])

  return {
    produtos,
    stats,
    loading,
    error,
    fetchProdutos,
    fetchStats,
    getProduto,
    createProduto,
    updateProduto,
    deleteProduto,
    updateEstoque,
    fetchEstoqueBaixo,
    refresh,
  }
}

