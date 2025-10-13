// ============================================
// HOOKS PARA CONSUMIR APIS EXTERNAS DO BACKEND
// ============================================

import { useState, useCallback } from 'react'

// ============================================
// TIPOS
// ============================================

interface Endereco {
  cep: string
  logradouro: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  codigo_ibge?: string
  latitude?: string
  longitude?: string
  ddd?: string
}

interface Empresa {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  situacao: string
  tipo_estabelecimento: string
  data_abertura: string
  cnae_principal: {
    codigo: number
    descricao: string
  }
  natureza_juridica: string
  porte: string
  capital_social: number
  endereco: Endereco
  contato: {
    telefone?: string
    telefone2?: string
    email?: string
  }
  socios: Array<{
    nome: string
    qualificacao: string
  }>
}

interface Estado {
  id: number
  sigla: string
  nome: string
  regiao: {
    id: number
    sigla: string
    nome: string
  }
}

interface Cidade {
  nome: string
  codigo_ibge: string
}

// ============================================
// CONFIGURAÇÃO DA API
// ============================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

// ============================================
// HOOK PARA CEP
// ============================================

interface UseCEPReturn {
  endereco: Endereco | null
  loading: boolean
  error: string | null
  buscarCEP: (cep: string) => Promise<void>
  limpar: () => void
}

export function useCEP(): UseCEPReturn {
  const [endereco, setEndereco] = useState<Endereco | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarCEP = useCallback(async (cep: string) => {
    if (!cep || cep.length < 8) return

    setLoading(true)
    setError(null)

    try {
      const cepLimpo = cep.replace(/\D/g, '')
      const response = await fetch(`${API_BASE}/cep/${cepLimpo}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar CEP')
      }

      const data: Endereco = await response.json()
      setEndereco(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar CEP')
      setEndereco(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const limpar = useCallback(() => {
    setEndereco(null)
    setError(null)
  }, [])

  return {
    endereco,
    loading,
    error,
    buscarCEP,
    limpar
  }
}

// ============================================
// HOOK PARA CNPJ
// ============================================

interface UseCNPJReturn {
  empresa: Empresa | null
  loading: boolean
  error: string | null
  buscarCNPJ: (cnpj: string) => Promise<void>
  limpar: () => void
}

export function useCNPJ(): UseCNPJReturn {
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarCNPJ = useCallback(async (cnpj: string) => {
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) return

    setLoading(true)
    setError(null)

    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '')
      const response = await fetch(`${API_BASE}/cnpj/${cnpjLimpo}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar CNPJ')
      }

      const data: Empresa = await response.json()
      setEmpresa(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar CNPJ')
      setEmpresa(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const limpar = useCallback(() => {
    setEmpresa(null)
    setError(null)
  }, [])

  return {
    empresa,
    loading,
    error,
    buscarCNPJ,
    limpar
  }
}

// ============================================
// HOOK PARA ESTADOS E CIDADES
// ============================================

interface UseLocalizacaoReturn {
  estados: Estado[]
  cidades: Cidade[]
  loadingEstados: boolean
  loadingCidades: boolean
  errorEstados: string | null
  errorCidades: string | null
  buscarEstados: () => Promise<void>
  buscarCidades: (uf: string) => Promise<void>
  limparCidades: () => void
}

export function useLocalizacao(): UseLocalizacaoReturn {
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [loadingCidades, setLoadingCidades] = useState(false)
  const [errorEstados, setErrorEstados] = useState<string | null>(null)
  const [errorCidades, setErrorCidades] = useState<string | null>(null)

  const buscarEstados = useCallback(async () => {
    setLoadingEstados(true)
    setErrorEstados(null)

    try {
      const response = await fetch(`${API_BASE}/estados`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar estados')
      }

      const data: Estado[] = await response.json()
      setEstados(data)
    } catch (err) {
      setErrorEstados(err instanceof Error ? err.message : 'Erro ao buscar estados')
    } finally {
      setLoadingEstados(false)
    }
  }, [])

  const buscarCidades = useCallback(async (uf: string) => {
    if (!uf) return

    setLoadingCidades(true)
    setErrorCidades(null)

    try {
      const response = await fetch(`${API_BASE}/estados/${uf}/cidades`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cidades')
      }

      const data: Cidade[] = await response.json()
      setCidades(data)
    } catch (err) {
      setErrorCidades(err instanceof Error ? err.message : 'Erro ao buscar cidades')
      setCidades([])
    } finally {
      setLoadingCidades(false)
    }
  }, [])

  const limparCidades = useCallback(() => {
    setCidades([])
    setErrorCidades(null)
  }, [])

  return {
    estados,
    cidades,
    loadingEstados,
    loadingCidades,
    errorEstados,
    errorCidades,
    buscarEstados,
    buscarCidades,
    limparCidades
  }
}

// ============================================
// HOOK COMBINADO PARA FORMULÁRIOS
// ============================================

interface UseFormularioReturn {
  endereco: Endereco | null
  empresa: Empresa | null
  estados: Estado[]
  cidades: Cidade[]
  loading: boolean
  error: string | null
  buscarDadosFormulario: (params: { cep?: string; uf?: string }) => Promise<void>
  limpar: () => void
}

export function useFormulario(): UseFormularioReturn {
  const [endereco, setEndereco] = useState<Endereco | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarDadosFormulario = useCallback(async (params: { cep?: string; uf?: string }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params.cep) searchParams.append('cep', params.cep)
      if (params.uf) searchParams.append('uf', params.uf)

      const response = await fetch(`${API_BASE}/formulario/dados?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do formulário')
      }

      const data = await response.json()
      
      if (data.estados) setEstados(data.estados)
      if (data.endereco) setEndereco(data.endereco)
      if (data.cidades) setCidades(data.cidades)
      if (data.erro_cep) setError(data.erro_cep)
      if (data.erro_cidades) setError(data.erro_cidades)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  const limpar = useCallback(() => {
    setEndereco(null)
    setEmpresa(null)
    setCidades([])
    setError(null)
  }, [])

  return {
    endereco,
    empresa,
    estados,
    cidades,
    loading,
    error,
    buscarDadosFormulario,
    limpar
  }
}
