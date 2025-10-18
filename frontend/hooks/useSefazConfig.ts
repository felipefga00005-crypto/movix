"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

interface SefazConfig {
  id?: number
  ambiente: number // 1=Produção, 2=Homologação
  uf: string
  versaoLayout: string
  timeoutConexao: number
  timeoutEnvio: number
  timeoutConsulta: number
  tentativasEnvio: number
  intervaloTentativas: number
  salvarXmlEnvio: boolean
  salvarXmlRetorno: boolean
  validarXml: boolean
  compactarXml: boolean
  created_at?: string
  updated_at?: string
}

interface UseSefazConfigOptions {
  key?: number
}

export function useSefazConfig(options: UseSefazConfigOptions = {}) {
  const { key = 0 } = options

  const [config, setConfig] = useState<SefazConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar configurações SEFAZ
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/sefaz/config')
        
        if (!response.ok) {
          throw new Error('API não implementada')
        }

        const data = await response.json()
        setConfig(data)
      } catch (apiError) {
        console.log('API de configuração SEFAZ não disponível, usando dados simulados')
        
        // Dados simulados como fallback
        setConfig({
          id: 1,
          ambiente: 2, // Homologação
          uf: "SP",
          versaoLayout: "4.00",
          timeoutConexao: 30000,
          timeoutEnvio: 60000,
          timeoutConsulta: 30000,
          tentativasEnvio: 3,
          intervaloTentativas: 5000,
          salvarXmlEnvio: true,
          salvarXmlRetorno: true,
          validarXml: true,
          compactarXml: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      console.error('Erro ao carregar configuração SEFAZ:', err)
      setError(err.message || 'Erro ao carregar configuração SEFAZ')
    } finally {
      setLoading(false)
    }
  }, [])

  // Salvar configurações
  const saveConfig = useCallback(async (configData: Partial<SefazConfig>) => {
    try {
      setLoading(true)

      const response = await fetch('/api/sefaz/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configuração')
      }

      const data = await response.json()
      setConfig(data)
      toast.success('Configuração SEFAZ salva com sucesso!')
      
      return data
    } catch (err: any) {
      console.error('Erro ao salvar configuração SEFAZ:', err)
      toast.error('Erro ao salvar configuração SEFAZ')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Testar conectividade
  const testConnectivity = useCallback(async () => {
    try {
      const response = await fetch('/api/sefaz/test-connectivity', {
        method: 'POST',
      })

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
    loadConfig()
  }, [loadConfig])

  // Effect para carregar dados quando key muda
  useEffect(() => {
    loadConfig()
  }, [loadConfig, key])

  return {
    // Estado
    config,
    loading,
    error,
    
    // Ações
    refetch,
    saveConfig,
    testConnectivity,
  }
}
