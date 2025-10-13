"use client"

// ============================================
// HOOK - useUsuarios
// ============================================

import { useState, useEffect, useCallback } from "react"
import { usuariosApi } from "@/lib/api"
import type {
  Usuario,
  CreateUsuarioDTO,
  UpdateUsuarioDTO,
  UpdateSenhaDTO,
  UsuarioStats,
  QueryParams,
} from "@/types"

interface UseUsuariosOptions {
  autoFetch?: boolean
  initialParams?: QueryParams
}

export function useUsuarios(options: UseUsuariosOptions = {}) {
  const { autoFetch = true, initialParams } = options

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [stats, setStats] = useState<UsuarioStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar todos os usuários
  const fetchUsuarios = useCallback(async (params?: QueryParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await usuariosApi.getAll(params)
      setUsuarios(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar usuários"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const data = await usuariosApi.getStats()
      setStats(data)
      return data
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err)
      throw err
    }
  }, [])

  // Buscar usuário por ID
  const getUsuario = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await usuariosApi.getById(id)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar usuário"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar usuário
  const createUsuario = useCallback(async (data: CreateUsuarioDTO) => {
    setLoading(true)
    setError(null)
    try {
      const newUsuario = await usuariosApi.create(data)
      setUsuarios((prev) => [...prev, newUsuario])
      return newUsuario
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar usuário"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar usuário
  const updateUsuario = useCallback(async (id: number, data: UpdateUsuarioDTO) => {
    setLoading(true)
    setError(null)
    try {
      const updatedUsuario = await usuariosApi.update(id, data)
      setUsuarios((prev) =>
        prev.map((usuario) => (usuario.id === id ? updatedUsuario : usuario))
      )
      return updatedUsuario
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar usuário"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Deletar usuário
  const deleteUsuario = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await usuariosApi.delete(id)
      setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao deletar usuário"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar senha
  const updateSenha = useCallback(async (id: number, data: UpdateSenhaDTO) => {
    setLoading(true)
    setError(null)
    try {
      await usuariosApi.updateSenha(id, data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar senha"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Recarregar dados
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchUsuarios(initialParams),
      fetchStats(),
    ])
  }, [fetchUsuarios, fetchStats, initialParams])

  // Auto-fetch ao montar
  useEffect(() => {
    if (autoFetch) {
      refresh()
    }
  }, [autoFetch])

  return {
    usuarios,
    stats,
    loading,
    error,
    fetchUsuarios,
    fetchStats,
    getUsuario,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    updateSenha,
    refresh,
  }
}

