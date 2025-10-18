"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

interface DocumentoFiscal {
  id: number
  tipo: string // 'NFCe', 'NFe', etc.
  numero: string
  serie: number
  chaveAcesso: string
  status: string // 'autorizada', 'cancelada', 'rejeitada', etc.
  dataEmissao: string
  dataAutorizacao?: string
  valorTotal: number
  cliente?: {
    id: number
    nome: string
    cpfCnpj?: string
  }
  vendaId?: number
  protocoloAutorizacao?: string
  motivoRejeicao?: string
  xml?: string
  created_at: string
  updated_at: string
}

interface UseDocumentosFiscaisOptions {
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
  status?: string
  tipo?: string
  dataInicio?: string
  dataFim?: string
  limit?: number
  offset?: number
}

export function useDocumentosFiscais(options: UseDocumentosFiscaisOptions = {}) {
  const { key = 0 } = options

  const [documentos, setDocumentos] = useState<DocumentoFiscal[]>([])
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

  // Carregar documentos fiscais
  const loadDocumentos = useCallback(async () => {
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

        const response = await fetch(`/api/documentos-fiscais?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('API não implementada')
        }

        const data = await response.json()
        setDocumentos(data.data || [])
        setPagination({
          page: Math.floor((data.offset || 0) / (data.limit || 20)) + 1,
          limit: data.limit || 20,
          total: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / (data.limit || 20)),
          offset: data.offset || 0,
        })
      } catch (apiError) {
        console.log('API de documentos fiscais não disponível, usando dados simulados')
        
        // Dados simulados como fallback
        const documentosSimulados: DocumentoFiscal[] = [
          {
            id: 1,
            tipo: "NFCe",
            numero: "000000001",
            serie: 1,
            chaveAcesso: "35240111222333000181650010000000011123456789",
            status: "autorizada",
            dataEmissao: new Date().toISOString(),
            dataAutorizacao: new Date().toISOString(),
            valorTotal: 150.00,
            cliente: {
              id: 1,
              nome: "João Silva",
              cpfCnpj: "123.456.789-00"
            },
            vendaId: 1,
            protocoloAutorizacao: "135240000000001",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            tipo: "NFCe",
            numero: "000000002",
            serie: 1,
            chaveAcesso: "35240111222333000181650010000000021123456789",
            status: "cancelada",
            dataEmissao: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            dataAutorizacao: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            valorTotal: 75.50,
            vendaId: 2,
            protocoloAutorizacao: "135240000000002",
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]
        
        setDocumentos(documentosSimulados)
        setPagination({
          page: 1,
          limit: 20,
          total: documentosSimulados.length,
          totalPages: 1,
          offset: 0,
        })
      }
    } catch (err: any) {
      console.error('Erro ao carregar documentos fiscais:', err)
      setError(err.message || 'Erro ao carregar documentos fiscais')
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
    loadDocumentos()
  }, [loadDocumentos])

  // Effect para carregar dados quando filtros ou key mudam
  useEffect(() => {
    loadDocumentos()
  }, [loadDocumentos, key])

  return {
    // Estado
    documentos,
    loading,
    error,
    pagination,
    filters,
    
    // Ações
    setFilters: updateFilters,
    refetch,
  }
}
