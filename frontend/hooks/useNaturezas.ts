"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import type { NaturezaOperacao } from "@/types/natureza"

interface UseNaturezasOptions {
  key?: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  offset: number
}

interface Filters {
  search?: string
  ativo?: boolean
  limit?: number
  offset?: number
}

export function useNaturezas(options: UseNaturezasOptions = {}) {
  const { key = 0 } = options

  const [naturezas, setNaturezas] = useState<NaturezaOperacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    offset: 0,
  })
  const [filters, setFilters] = useState<Filters>({
    limit: 20,
    offset: 0,
  })

  // Carregar naturezas
  const loadNaturezas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString())
          }
        })

        const response = await fetch(`/api/naturezas?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('API não implementada')
        }

        const data = await response.json()
        setNaturezas(data.data || [])
        setPagination({
          page: Math.floor((data.offset || 0) / (data.limit || 20)) + 1,
          limit: data.limit || 20,
          total: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / (data.limit || 20)),
          offset: data.offset || 0,
        })
      } catch (apiError) {
        console.log('API de naturezas não disponível, usando dados simulados')
        
        // Dados simulados como fallback
        const naturezasSimuladas: NaturezaOperacao[] = [
          {
            id: 1,
            codigo: "001",
            descricao: "Venda de Mercadoria",
            cfop_dentro_estado: "5102",
            cfop_fora_estado: "6102",
            finalidade_nfe: 1,
            tipo_operacao: 1,
            consumidor_final: true,
            presenca_comprador: 1,
            calcular_icms: true,
            calcular_ipi: false,
            calcular_pis: true,
            calcular_cofins: true,
            ativo: true,
            padrao: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            codigo: "002",
            descricao: "Devolução de Mercadoria",
            cfop_dentro_estado: "5202",
            cfop_fora_estado: "6202",
            finalidade_nfe: 4,
            tipo_operacao: 1,
            consumidor_final: false,
            presenca_comprador: 0,
            calcular_icms: true,
            calcular_ipi: false,
            calcular_pis: true,
            calcular_cofins: true,
            ativo: true,
            padrao: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]
        
        setNaturezas(naturezasSimuladas)
        setPagination({
          page: 1,
          limit: 20,
          total: naturezasSimuladas.length,
          totalPages: 1,
          offset: 0,
        })
      }
    } catch (err: any) {
      console.error('Erro ao carregar naturezas:', err)
      setError(err.message || 'Erro ao carregar naturezas')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
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
    loadNaturezas()
  }, [loadNaturezas])

  // Effect para carregar dados quando filtros ou key mudam
  useEffect(() => {
    loadNaturezas()
  }, [loadNaturezas, key])

  return {
    // Estado
    naturezas,
    loading,
    error,
    pagination,
    filters,
    
    // Ações
    setFilters: updateFilters,
    refetch,
  }
}
