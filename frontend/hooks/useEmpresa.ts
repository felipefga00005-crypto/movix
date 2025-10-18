"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import type { Empresa, CreateEmpresaRequest, UpdateEmpresaRequest, EmpresaStats } from "@/types/empresa"

interface UseEmpresaOptions {
  key?: number
}

export function useEmpresa(options: UseEmpresaOptions = {}) {
  const { key = 0 } = options

  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<EmpresaStats | null>(null)

  // Carregar dados da empresa
  const loadEmpresa = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/empresa')

        if (!response.ok) {
          throw new Error('API não implementada')
        }

        const data = await response.json()
        setEmpresa(data)
      } catch (apiError) {
        console.log('API de empresa não disponível, usando dados simulados')

        // Dados simulados como fallback
        setEmpresa({
          id: 1,
          razao_social: "EMPRESA TESTE LTDA",
          nome_fantasia: "Empresa Teste",
          cnpj: "11.222.333/0001-81",
          inscricao_estadual: "123456789",
          logradouro: "Rua Teste",
          numero: "123",
          bairro: "Centro",
          cep: "01234-567",
          uf: "SP",
          cidade_id: 3550308,
          cidade: "São Paulo",
          telefone: "(11) 1234-5678",
          email: "teste@empresa.com",
          regime_tributario: 1,
          ambiente_nfe: 2,
          serie_nfe: 1,
          serie_nfce: 1,
          proximo_numero_nfe: 1,
          proximo_numero_nfce: 1,
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      console.error('Erro ao carregar empresa:', err)
      setError(err.message || 'Erro ao carregar empresa')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      try {
        const response = await fetch('/api/empresa/stats')

        if (!response.ok) {
          throw new Error('API não implementada')
        }

        const data = await response.json()
        setStats(data)
      } catch (apiError) {
        console.log('API de stats não disponível, usando dados simulados')

        // Dados simulados como fallback
        setStats({
          total: 1,
          ativas: 1,
          inativas: 0,
          comCertificado: 0,
          semCertificado: 1,
          certificadosVencendo: 0,
          certificadosVencidos: 0,
        })
      }
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }, [])

  // Criar empresa
  const createEmpresa = useCallback(async (empresaData: CreateEmpresaRequest) => {
    try {
      setLoading(true)

      const response = await fetch('/api/empresa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empresaData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar empresa')
      }

      const data = await response.json()
      setEmpresa(data)
      toast.success('Empresa criada com sucesso!')
      
      return data
    } catch (err: any) {
      console.error('Erro ao criar empresa:', err)
      toast.error('Erro ao criar empresa')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar empresa
  const updateEmpresa = useCallback(async (empresaData: UpdateEmpresaRequest) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/empresa/${empresaData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empresaData),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar empresa')
      }

      const data = await response.json()
      setEmpresa(data)
      toast.success('Empresa atualizada com sucesso!')
      
      return data
    } catch (err: any) {
      console.error('Erro ao atualizar empresa:', err)
      toast.error('Erro ao atualizar empresa')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Upload de certificado
  const uploadCertificado = useCallback(async (certificadoBase64: string, senha: string) => {
    try {
      setLoading(true)

      const response = await fetch('/api/empresa/certificado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificadoA1: certificadoBase64,
          senhaCertificado: senha,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do certificado')
      }

      const data = await response.json()
      
      // Atualizar empresa com novo certificado
      if (empresa) {
        setEmpresa({
          ...empresa,
          certificado_a1: certificadoBase64,
          senha_certificado: senha,
          certificado_valido_ate: data.validoAte,
        })
      }
      
      toast.success('Certificado enviado com sucesso!')
      
      return data
    } catch (err: any) {
      console.error('Erro ao fazer upload do certificado:', err)
      toast.error('Erro ao fazer upload do certificado')
      throw err
    } finally {
      setLoading(false)
    }
  }, [empresa])

  // Validar certificado
  const validarCertificado = useCallback(async () => {
    try {
      if (!empresa?.certificado_a1 || !empresa?.senha_certificado) {
        throw new Error('Certificado não configurado')
      }

      const response = await fetch('/api/fiscal/validar-certificado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificadoBase64: empresa.certificado_a1,
          senha: empresa.senha_certificado,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao validar certificado')
      }

      const data = await response.json()
      
      if (data.valido) {
        toast.success('Certificado válido!')
      } else {
        toast.error('Certificado inválido: ' + data.erros.join(', '))
      }
      
      return data
    } catch (err: any) {
      console.error('Erro ao validar certificado:', err)
      toast.error('Erro ao validar certificado')
      throw err
    }
  }, [empresa])

  // Testar conectividade SEFAZ
  const testarConectividade = useCallback(async () => {
    try {
      const response = await fetch('/api/fiscal/conectividade')
      
      if (!response.ok) {
        throw new Error('Erro ao testar conectividade')
      }

      const data = await response.json()
      
      if (data.sucesso) {
        toast.success('Conectividade com SEFAZ OK!')
      } else {
        toast.error('Falha na conectividade com SEFAZ')
      }
      
      return data
    } catch (err: any) {
      console.error('Erro ao testar conectividade:', err)
      toast.error('Erro ao testar conectividade')
      throw err
    }
  }, [])

  // Recarregar dados
  const refetch = useCallback(() => {
    loadEmpresa()
    loadStats()
  }, [loadEmpresa, loadStats])

  // Effect para carregar dados quando key muda
  useEffect(() => {
    loadEmpresa()
    loadStats()
  }, [loadEmpresa, loadStats, key])

  return {
    // Estado
    empresa,
    loading,
    error,
    stats,
    
    // Ações
    refetch,
    createEmpresa,
    updateEmpresa,
    uploadCertificado,
    validarCertificado,
    testarConectividade,
  }
}
