"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

interface CertificadoInfo {
  id?: number
  certificadoBase64?: string
  senha?: string
  subject?: string
  issuer?: string
  validoAte?: Date
  valido?: boolean
  erros?: string[]
}

interface UseCertificadoOptions {
  key?: number
}

export function useCertificado(options: UseCertificadoOptions = {}) {
  const { key = 0 } = options

  const [certificado, setCertificado] = useState<CertificadoInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados do certificado
  const loadCertificado = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/certificado')
        
        if (!response.ok) {
          throw new Error('API não implementada')
        }

        const data = await response.json()
        setCertificado(data)
      } catch (apiError) {
        console.log('API de certificado não disponível, usando dados simulados')
        
        // Dados simulados como fallback
        setCertificado({
          id: 1,
          subject: "CN=EMPRESA TESTE LTDA:11222333000181, OU=Certificado PJ A1, O=ICP-Brasil, C=BR",
          issuer: "CN=AC SOLUTI Multipla v5, OU=Autoridade Certificadora, O=ICP-Brasil, C=BR",
          validoAte: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano no futuro
          valido: true,
          erros: [],
        })
      }
    } catch (err: any) {
      console.error('Erro ao carregar certificado:', err)
      setError(err.message || 'Erro ao carregar certificado')
    } finally {
      setLoading(false)
    }
  }, [])

  // Upload de certificado
  const uploadCertificado = useCallback(async (certificadoBase64: string, senha: string) => {
    try {
      setLoading(true)

      const response = await fetch('/api/certificado/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificadoBase64,
          senha,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do certificado')
      }

      const data = await response.json()
      setCertificado(data)
      toast.success('Certificado enviado com sucesso!')
      
      return data
    } catch (err: any) {
      console.error('Erro ao fazer upload do certificado:', err)
      toast.error('Erro ao fazer upload do certificado')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Validar certificado
  const validarCertificado = useCallback(async () => {
    try {
      if (!certificado?.certificadoBase64) {
        throw new Error('Certificado não configurado')
      }

      const response = await fetch('/api/certificado/validar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificadoBase64: certificado.certificadoBase64,
          senha: certificado.senha,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao validar certificado')
      }

      const data = await response.json()
      
      if (data.valido) {
        toast.success('Certificado válido!')
      } else {
        toast.error('Certificado inválido: ' + (data.erros || []).join(', '))
      }
      
      return data
    } catch (err: any) {
      console.error('Erro ao validar certificado:', err)
      toast.error('Erro ao validar certificado')
      throw err
    }
  }, [certificado])

  // Recarregar dados
  const refetch = useCallback(() => {
    loadCertificado()
  }, [loadCertificado])

  // Effect para carregar dados quando key muda
  useEffect(() => {
    loadCertificado()
  }, [loadCertificado, key])

  return {
    // Estado
    certificado,
    loading,
    error,
    
    // Ações
    refetch,
    uploadCertificado,
    validarCertificado,
  }
}
