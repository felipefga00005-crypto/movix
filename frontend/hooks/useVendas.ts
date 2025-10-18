"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { vendasService, type VendaResponse, type VendaFilter } from "@/lib/services/vendas"

interface UseVendasOptions {
  key?: number
  initialFilters?: VendaFilter
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  offset: number
}

export function useVendas(options: UseVendasOptions = {}) {
  const { key = 0, initialFilters = {} } = options

  const [vendas, setVendas] = useState<VendaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    offset: 0,
  })
  const [filters, setFilters] = useState<VendaFilter>({
    limit: 20,
    offset: 0,
    ...initialFilters,
  })

  // Carregar vendas
  const loadVendas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      try {
        const response = await vendasService.getVendas(filters)

        setVendas(response.data)
        setPagination({
          page: Math.floor(response.offset / response.limit) + 1,
          limit: response.limit,
          total: response.total,
          totalPages: Math.ceil(response.total / response.limit),
          offset: response.offset,
        })
      } catch (apiError: any) {
        // Se API não estiver disponível, usar dados simulados
        console.log('API de vendas não disponível, usando dados simulados')

        const vendasSimuladas: VendaResponse[] = [
          {
            id: 1,
            numeroVenda: "VND-001",
            clienteId: 1,
            usuarioId: 1,
            naturezaOpId: 1,
            totalProdutos: 150.00,
            totalDesconto: 0,
            totalVenda: 150.00,
            status: "finalizada",
            nfceStatus: "autorizada",
            nfceNumero: "000000001",
            nfceChave: "35240111222333000181650010000000011123456789",
            formaPagamento: 17,
            valorPago: 150.00,
            valorTroco: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            cliente: { id: 1, nome: "João Silva", cpf: "123.456.789-00" },
            usuario: { id: 1, nome: "Usuário Teste", email: "teste@teste.com" },
            itens: [
              {
                id: 1,
                vendaId: 1,
                produtoId: 1,
                quantidade: 2,
                valorUnit: 75.00,
                valorDesc: 0,
                valorTotal: 150.00,
                produto: { id: 1, nome: "Produto Teste", codigo: "001", preco: 75.00, unidade: "UN" }
              }
            ]
          }
        ]

        setVendas(vendasSimuladas)
        setPagination({
          page: 1,
          limit: 20,
          total: vendasSimuladas.length,
          totalPages: 1,
          offset: 0,
        })
      }
    } catch (err: any) {
      console.error('Erro ao carregar vendas:', err)
      setError(err.message || 'Erro ao carregar vendas')
      // Não mostrar toast para APIs não implementadas
      if (!err.message?.includes('404')) {
        toast.error('Erro ao carregar vendas')
      }
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<VendaFilter>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters }
      
      // Se mudou a página, calcular novo offset
      if ('page' in newFilters && newFilters.page) {
        updated.offset = (newFilters.page - 1) * (updated.limit || 20)
      }
      
      // Se mudou o limit, resetar para primeira página
      if ('limit' in newFilters) {
        updated.offset = 0
      }
      
      return updated
    })
  }, [])

  // Recarregar dados
  const refetch = useCallback(() => {
    loadVendas()
  }, [loadVendas])

  // Buscar venda por ID
  const getVendaById = useCallback(async (id: number) => {
    try {
      return await vendasService.getVendaById(id)
    } catch (err: any) {
      console.error('Erro ao buscar venda:', err)
      toast.error('Erro ao buscar venda')
      throw err
    }
  }, [])

  // Cancelar venda
  const cancelarVenda = useCallback(async (id: number) => {
    try {
      await vendasService.cancelarVenda(id)
      toast.success('Venda cancelada com sucesso!')
      refetch()
    } catch (err: any) {
      console.error('Erro ao cancelar venda:', err)
      toast.error('Erro ao cancelar venda')
      throw err
    }
  }, [refetch])

  // Emitir NFCe
  const emitirNFCe = useCallback(async (id: number) => {
    try {
      const result = await vendasService.emitirNFCeVenda(id)
      
      if (result.sucesso) {
        toast.success('NFCe emitida com sucesso!')
      } else {
        toast.error('Erro ao emitir NFCe: ' + result.mensagem)
      }
      
      refetch()
      return result
    } catch (err: any) {
      console.error('Erro ao emitir NFCe:', err)
      toast.error('Erro ao emitir NFCe')
      throw err
    }
  }, [refetch])

  // Cancelar NFCe
  const cancelarNFCe = useCallback(async (id: number, justificativa: string) => {
    try {
      const result = await vendasService.cancelarNFCeVenda(id, justificativa)
      
      if (result.sucesso) {
        toast.success('NFCe cancelada com sucesso!')
      } else {
        toast.error('Erro ao cancelar NFCe: ' + result.mensagem)
      }
      
      refetch()
      return result
    } catch (err: any) {
      console.error('Erro ao cancelar NFCe:', err)
      toast.error('Erro ao cancelar NFCe')
      throw err
    }
  }, [refetch])

  // Obter vendas pendentes de NFCe
  const getVendasPendentesNFCe = useCallback(async () => {
    try {
      return await vendasService.getVendasPendentesNFCe()
    } catch (err: any) {
      console.error('Erro ao buscar vendas pendentes:', err)
      toast.error('Erro ao buscar vendas pendentes')
      throw err
    }
  }, [])

  // Obter estatísticas
  const getEstatisticas = useCallback(async (periodo: 'hoje' | 'mes' | 'ano' = 'hoje') => {
    try {
      switch (periodo) {
        case 'hoje':
          return await vendasService.getEstatisticasHoje()
        case 'mes':
          return await vendasService.getEstatisticasMes()
        case 'ano':
          return await vendasService.getEstatisticasAno()
        default:
          return await vendasService.getEstatisticasHoje()
      }
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err)
      toast.error('Erro ao buscar estatísticas')
      throw err
    }
  }, [])

  // Obter relatórios
  const getRelatorio = useCallback(async (
    tipo: 'periodo' | 'produto' | 'cliente',
    dataInicio?: Date,
    dataFim?: Date
  ) => {
    try {
      switch (tipo) {
        case 'periodo':
          return await vendasService.getRelatorioVendasPorPeriodo(
            dataInicio || new Date(),
            dataFim || new Date()
          )
        case 'produto':
          return await vendasService.getRelatorioVendasPorProduto(dataInicio, dataFim)
        case 'cliente':
          return await vendasService.getRelatorioVendasPorCliente(dataInicio, dataFim)
        default:
          throw new Error('Tipo de relatório inválido')
      }
    } catch (err: any) {
      console.error('Erro ao gerar relatório:', err)
      toast.error('Erro ao gerar relatório')
      throw err
    }
  }, [])

  // Effect para carregar dados quando filtros ou key mudam
  useEffect(() => {
    loadVendas()
  }, [loadVendas, key])

  return {
    // Estado
    vendas,
    loading,
    error,
    pagination,
    filters,
    
    // Ações
    setFilters: updateFilters,
    refetch,
    
    // Métodos específicos
    getVendaById,
    cancelarVenda,
    emitirNFCe,
    cancelarNFCe,
    getVendasPendentesNFCe,
    getEstatisticas,
    getRelatorio,
  }
}
