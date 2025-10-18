import { useState, useEffect, useCallback } from 'react'
import { produtoService } from '@/lib/services/produto.service'
import { useAuth } from '@/hooks/useAuth'
import type { Produto, ProdutoStats, ProdutoSearchParams, MovimentacaoEstoque } from '@/types/produto'
import { toast } from 'sonner'

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<ProdutoStats>({
    total: 0,
    ativos: 0,
    inativos: 0,
    emPromocao: 0,
    emDestaque: 0,
    baixoEstoque: 0,
    semEstoque: 0,
    valorTotalEstoque: 0,
    valorMedioVenda: 0,
    margemLucroMedia: 0,
    porCategoria: {},
    porMarca: {},
    porFornecedor: {}
  })
  const [categorias, setCategorias] = useState<string[]>([])
  const [marcas, setMarcas] = useState<string[]>([])
  const [fornecedores, setFornecedores] = useState<string[]>([])
  const { logoutOnTokenExpired } = useAuth()

  const loadProdutos = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await produtoService.getAll()
      setProdutos(data)
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error)

      // Se for erro de autenticação, faz logout automático
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao carregar produtos')
    } finally {
      setIsLoading(false)
    }
  }, [logoutOnTokenExpired])

  const loadStats = useCallback(async () => {
    try {
      const statsData = await produtoService.getStats()
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
        emPromocao: 0,
        emDestaque: 0,
        baixoEstoque: 0,
        semEstoque: 0,
        valorTotalEstoque: 0,
        valorMedioVenda: 0,
        margemLucroMedia: 0,
        porCategoria: {},
        porMarca: {},
        porFornecedor: {}
      })
    }
  }, [logoutOnTokenExpired])

  const loadCategorias = useCallback(async () => {
    try {
      console.log('Carregando categorias de produtos...')
      const categoriasData = await produtoService.getCategorias()
      setCategorias(categoriasData)
      console.log('Categorias carregadas:', categoriasData)
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

  const loadMarcas = useCallback(async () => {
    try {
      const marcasData = await produtoService.getMarcas()
      setMarcas(marcasData)
    } catch (error: any) {
      console.error('Erro ao carregar marcas:', error)

      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      // Se o endpoint não existir ou houver erro, usar array vazio
      setMarcas([])
    }
  }, [logoutOnTokenExpired])

  const loadFornecedores = useCallback(async () => {
    try {
      const fornecedoresData = await produtoService.getFornecedores()
      setFornecedores(fornecedoresData)
    } catch (error: any) {
      console.error('Erro ao carregar fornecedores:', error)

      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      // Se o endpoint não existir ou houver erro, usar array vazio
      setFornecedores([])
    }
  }, [logoutOnTokenExpired])

  const deleteProduto = useCallback(async (id: number) => {
    try {
      await produtoService.delete(id)
      setProdutos(prev => prev.filter(produto => produto.id !== id))
      toast.success('Produto excluído com sucesso')
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao excluir produto')
      throw error
    }
  }, [logoutOnTokenExpired])

  const activateProduto = useCallback(async (id: number) => {
    try {
      const updatedProduto = await produtoService.activate(id)
      setProdutos(prev => 
        prev.map(produto => 
          produto.id === id ? updatedProduto : produto
        )
      )
      toast.success('Produto ativado com sucesso')
    } catch (error: any) {
      console.error('Erro ao ativar produto:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao ativar produto')
      throw error
    }
  }, [logoutOnTokenExpired])

  const deactivateProduto = useCallback(async (id: number) => {
    try {
      const updatedProduto = await produtoService.deactivate(id)
      setProdutos(prev => 
        prev.map(produto => 
          produto.id === id ? updatedProduto : produto
        )
      )
      toast.success('Produto inativado com sucesso')
    } catch (error: any) {
      console.error('Erro ao inativar produto:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao inativar produto')
      throw error
    }
  }, [logoutOnTokenExpired])

  const setDestaque = useCallback(async (id: number, destaque: boolean) => {
    try {
      const updatedProduto = await produtoService.setDestaque(id, destaque)
      setProdutos(prev => 
        prev.map(produto => 
          produto.id === id ? updatedProduto : produto
        )
      )
      toast.success(`Produto ${destaque ? 'marcado como' : 'removido do'} destaque`)
    } catch (error: any) {
      console.error('Erro ao alterar destaque:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao alterar destaque do produto')
      throw error
    }
  }, [logoutOnTokenExpired])

  const setPromocao = useCallback(async (id: number, promocao: boolean, precoPromocional?: number) => {
    try {
      const updatedProduto = await produtoService.setPromocao(id, promocao, precoPromocional)
      setProdutos(prev => 
        prev.map(produto => 
          produto.id === id ? updatedProduto : produto
        )
      )
      toast.success(`Produto ${promocao ? 'colocado em' : 'removido da'} promoção`)
    } catch (error: any) {
      console.error('Erro ao alterar promoção:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao alterar promoção do produto')
      throw error
    }
  }, [logoutOnTokenExpired])

  const updateEstoque = useCallback(async (id: number, dados: {
    quantidade: number
    tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'
    motivo?: string
    documento?: string
    valorUnitario?: number
    observacoes?: string
  }) => {
    try {
      const updatedProduto = await produtoService.updateEstoque(id, dados)
      setProdutos(prev => 
        prev.map(produto => 
          produto.id === id ? updatedProduto : produto
        )
      )
      toast.success('Estoque atualizado com sucesso')
      return updatedProduto
    } catch (error: any) {
      console.error('Erro ao atualizar estoque:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao atualizar estoque')
      throw error
    }
  }, [logoutOnTokenExpired])

  const updatePrecos = useCallback(async (id: number, dados: {
    preco?: number
    precoCusto?: number
    precoPromocional?: number
    margemLucro?: number
    markup?: number
  }) => {
    try {
      const updatedProduto = await produtoService.updatePrecos(id, dados)
      setProdutos(prev => 
        prev.map(produto => 
          produto.id === id ? updatedProduto : produto
        )
      )
      toast.success('Preços atualizados com sucesso')
      return updatedProduto
    } catch (error: any) {
      console.error('Erro ao atualizar preços:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao atualizar preços')
      throw error
    }
  }, [logoutOnTokenExpired])

  const bulkActivate = useCallback(async (ids: number[]) => {
    try {
      await produtoService.bulkActivate(ids)
      await loadProdutos() // Recarrega a lista
      toast.success(`${ids.length} produto(s) ativado(s) com sucesso`)
    } catch (error: any) {
      console.error('Erro ao ativar produtos:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao ativar produtos')
      throw error
    }
  }, [loadProdutos, logoutOnTokenExpired])

  const bulkDeactivate = useCallback(async (ids: number[]) => {
    try {
      await produtoService.bulkDeactivate(ids)
      await loadProdutos() // Recarrega a lista
      toast.success(`${ids.length} produto(s) inativado(s) com sucesso`)
    } catch (error: any) {
      console.error('Erro ao inativar produtos:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao inativar produtos')
      throw error
    }
  }, [loadProdutos, logoutOnTokenExpired])

  const bulkDelete = useCallback(async (ids: number[]) => {
    try {
      await produtoService.bulkDelete(ids)
      setProdutos(prev => prev.filter(produto => !ids.includes(produto.id)))
      toast.success(`${ids.length} produto(s) excluído(s) com sucesso`)
    } catch (error: any) {
      console.error('Erro ao excluir produtos:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao excluir produtos')
      throw error
    }
  }, [logoutOnTokenExpired])

  const bulkUpdatePrecos = useCallback(async (ids: number[], dados: {
    preco?: number
    precoCusto?: number
    precoPromocional?: number
    percentualAumento?: number
    percentualDesconto?: number
  }) => {
    try {
      await produtoService.bulkUpdatePrecos(ids, dados)
      await loadProdutos() // Recarrega a lista
      toast.success(`Preços de ${ids.length} produto(s) atualizados com sucesso`)
    } catch (error: any) {
      console.error('Erro ao atualizar preços:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao atualizar preços')
      throw error
    }
  }, [loadProdutos, logoutOnTokenExpired])

  const searchProdutos = useCallback(async (params: ProdutoSearchParams) => {
    try {
      setIsLoading(true)
      const result = await produtoService.searchAdvanced(params)
      return result
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
      }

      toast.error('Erro ao buscar produtos')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [logoutOnTokenExpired])

  const getMovimentacoes = useCallback(async (id: number): Promise<MovimentacaoEstoque[]> => {
    try {
      return await produtoService.getMovimentacoes(id)
    } catch (error: any) {
      console.error('Erro ao buscar movimentações:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return []
      }

      toast.error('Erro ao buscar movimentações')
      throw error
    }
  }, [logoutOnTokenExpired])

  const duplicarProduto = useCallback(async (id: number, dados?: {
    nome?: string
    codigo?: string
  }) => {
    try {
      const novoProduto = await produtoService.duplicar(id, dados)
      setProdutos(prev => [novoProduto, ...prev])
      toast.success('Produto duplicado com sucesso')
      return novoProduto
    } catch (error: any) {
      console.error('Erro ao duplicar produto:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao duplicar produto')
      throw error
    }
  }, [logoutOnTokenExpired])

  const refreshProdutos = useCallback(() => {
    loadProdutos()
    loadStats()
  }, [loadProdutos, loadStats])

  const refreshAll = useCallback(() => {
    loadProdutos()
    loadStats()
    // Comentando temporariamente até o backend implementar estes endpoints
    // loadCategorias()
    // loadMarcas()
    // loadFornecedores()
  }, [loadProdutos, loadStats])

  useEffect(() => {
    loadProdutos()
    loadStats()
    // Comentando temporariamente até o backend implementar estes endpoints
    // loadCategorias()
    // loadMarcas()
    // loadFornecedores()
  }, [loadProdutos, loadStats])

  return {
    produtos,
    isLoading,
    stats,
    categorias,
    marcas,
    fornecedores,
    loadProdutos,
    loadStats,
    loadCategorias,
    loadMarcas,
    loadFornecedores,
    deleteProduto,
    activateProduto,
    deactivateProduto,
    setDestaque,
    setPromocao,
    updateEstoque,
    updatePrecos,
    bulkActivate,
    bulkDeactivate,
    bulkDelete,
    bulkUpdatePrecos,
    searchProdutos,
    getMovimentacoes,
    duplicarProduto,
    refreshProdutos,
    refreshAll,
  }
}
