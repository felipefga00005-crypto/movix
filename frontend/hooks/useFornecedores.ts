import { useState, useEffect, useCallback } from 'react'
import { fornecedorService } from '@/lib/services/fornecedor.service'
import { useAuth } from '@/hooks/useAuth'
import type { Fornecedor, FornecedorStats, FornecedorSearchParams } from '@/types/fornecedor'
import { toast } from 'sonner'

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<FornecedorStats>({
    total: 0,
    ativos: 0,
    inativos: 0,
    bloqueados: 0,
    pendentes: 0,
    porCategoria: {},
    valorTotalCompras: 0,
    fornecedoresComContrato: 0
  })
  const [categorias, setCategorias] = useState<string[]>([])
  const { logoutOnTokenExpired } = useAuth()

  const loadFornecedores = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await fornecedorService.getAll()
      setFornecedores(data)
    } catch (error: any) {
      console.error('Erro ao carregar fornecedores:', error)

      // Se for erro de autenticação, faz logout automático
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao carregar fornecedores')
    } finally {
      setIsLoading(false)
    }
  }, [logoutOnTokenExpired])

  const loadStats = useCallback(async () => {
    try {
      const statsData = await fornecedorService.getStats()
      setStats(statsData)
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)

      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      // Se o endpoint não existir ou houver erro, usar stats padrão
      setStats({
        total: 0,
        ativos: 0,
        inativos: 0,
        bloqueados: 0,
        pendentes: 0,
        porCategoria: {},
        valorTotalCompras: 0,
        fornecedoresComContrato: 0
      })
    }
  }, [logoutOnTokenExpired])

  const loadCategorias = useCallback(async () => {
    try {
      const categoriasData = await fornecedorService.getCategorias()
      setCategorias(categoriasData)
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error)

      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      // Se o endpoint não existir ou houver erro, usar array vazio
      setCategorias([])
    }
  }, [logoutOnTokenExpired])

  const deleteFornecedor = useCallback(async (id: number) => {
    try {
      await fornecedorService.delete(id)
      setFornecedores(prev => prev.filter(fornecedor => fornecedor.id !== id))
      toast.success('Fornecedor excluído com sucesso')
    } catch (error: any) {
      console.error('Erro ao excluir fornecedor:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao excluir fornecedor')
      throw error
    }
  }, [logoutOnTokenExpired])

  const activateFornecedor = useCallback(async (id: number) => {
    try {
      const updatedFornecedor = await fornecedorService.activate(id)
      setFornecedores(prev => 
        prev.map(fornecedor => 
          fornecedor.id === id ? updatedFornecedor : fornecedor
        )
      )
      toast.success('Fornecedor ativado com sucesso')
    } catch (error: any) {
      console.error('Erro ao ativar fornecedor:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao ativar fornecedor')
      throw error
    }
  }, [logoutOnTokenExpired])

  const deactivateFornecedor = useCallback(async (id: number) => {
    try {
      const updatedFornecedor = await fornecedorService.deactivate(id)
      setFornecedores(prev => 
        prev.map(fornecedor => 
          fornecedor.id === id ? updatedFornecedor : fornecedor
        )
      )
      toast.success('Fornecedor inativado com sucesso')
    } catch (error: any) {
      console.error('Erro ao inativar fornecedor:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao inativar fornecedor')
      throw error
    }
  }, [logoutOnTokenExpired])

  const blockFornecedor = useCallback(async (id: number) => {
    try {
      const updatedFornecedor = await fornecedorService.block(id)
      setFornecedores(prev => 
        prev.map(fornecedor => 
          fornecedor.id === id ? updatedFornecedor : fornecedor
        )
      )
      toast.success('Fornecedor bloqueado com sucesso')
    } catch (error: any) {
      console.error('Erro ao bloquear fornecedor:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao bloquear fornecedor')
      throw error
    }
  }, [logoutOnTokenExpired])

  const unblockFornecedor = useCallback(async (id: number) => {
    try {
      const updatedFornecedor = await fornecedorService.unblock(id)
      setFornecedores(prev => 
        prev.map(fornecedor => 
          fornecedor.id === id ? updatedFornecedor : fornecedor
        )
      )
      toast.success('Fornecedor desbloqueado com sucesso')
    } catch (error: any) {
      console.error('Erro ao desbloquear fornecedor:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao desbloquear fornecedor')
      throw error
    }
  }, [logoutOnTokenExpired])

  const bulkActivate = useCallback(async (ids: number[]) => {
    try {
      await fornecedorService.bulkActivate(ids)
      await loadFornecedores() // Recarrega a lista
      toast.success(`${ids.length} fornecedor(es) ativado(s) com sucesso`)
    } catch (error: any) {
      console.error('Erro ao ativar fornecedores:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao ativar fornecedores')
      throw error
    }
  }, [loadFornecedores, logoutOnTokenExpired])

  const bulkDeactivate = useCallback(async (ids: number[]) => {
    try {
      await fornecedorService.bulkDeactivate(ids)
      await loadFornecedores() // Recarrega a lista
      toast.success(`${ids.length} fornecedor(es) inativado(s) com sucesso`)
    } catch (error: any) {
      console.error('Erro ao inativar fornecedores:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao inativar fornecedores')
      throw error
    }
  }, [loadFornecedores, logoutOnTokenExpired])

  const bulkBlock = useCallback(async (ids: number[]) => {
    try {
      await fornecedorService.bulkBlock(ids)
      await loadFornecedores() // Recarrega a lista
      toast.success(`${ids.length} fornecedor(es) bloqueado(s) com sucesso`)
    } catch (error: any) {
      console.error('Erro ao bloquear fornecedores:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao bloquear fornecedores')
      throw error
    }
  }, [loadFornecedores, logoutOnTokenExpired])

  const bulkDelete = useCallback(async (ids: number[]) => {
    try {
      await fornecedorService.bulkDelete(ids)
      setFornecedores(prev => prev.filter(fornecedor => !ids.includes(fornecedor.id)))
      toast.success(`${ids.length} fornecedor(es) excluído(s) com sucesso`)
    } catch (error: any) {
      console.error('Erro ao excluir fornecedores:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao excluir fornecedores')
      throw error
    }
  }, [logoutOnTokenExpired])

  const searchFornecedores = useCallback(async (params: FornecedorSearchParams) => {
    try {
      setIsLoading(true)
      const result = await fornecedorService.searchAdvanced(params)
      return result
    } catch (error: any) {
      console.error('Erro ao buscar fornecedores:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
      }

      toast.error('Erro ao buscar fornecedores')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [logoutOnTokenExpired])

  const refreshFornecedores = useCallback(() => {
    loadFornecedores()
    loadStats()
  }, [loadFornecedores, loadStats])

  const refreshAll = useCallback(() => {
    loadFornecedores()
    loadStats()
    loadCategorias()
  }, [loadFornecedores, loadStats, loadCategorias])

  useEffect(() => {
    loadFornecedores()
    loadStats()
    loadCategorias()
  }, [loadFornecedores, loadStats, loadCategorias])

  return {
    fornecedores,
    isLoading,
    stats,
    categorias,
    loadFornecedores,
    loadStats,
    loadCategorias,
    deleteFornecedor,
    activateFornecedor,
    deactivateFornecedor,
    blockFornecedor,
    unblockFornecedor,
    bulkActivate,
    bulkDeactivate,
    bulkBlock,
    bulkDelete,
    searchFornecedores,
    refreshFornecedores,
    refreshAll,
  }
}
