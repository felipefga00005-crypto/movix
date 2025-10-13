// ============================================
// HOOKS PARA INTEGRAÇÃO COM APIS BRASILEIRAS
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { 
  CEPService, 
  CNPJService, 
  IBGEService, 
  LocalizacaoService,
  CacheService 
} from '@/services/api-brasil'
import { EnderecoCompleto } from '@/types/cep'
import { EmpresaInfo } from '@/types/cnpj'
import { Estado, Cidade } from '@/types/ibge'

// ============================================
// HOOK PARA CEP
// ============================================

interface UseCEPReturn {
  endereco: EnderecoCompleto | null
  loading: boolean
  error: string | null
  buscarCEP: (cep: string) => Promise<void>
  limpar: () => void
}

export function useCEP(): UseCEPReturn {
  const [endereco, setEndereco] = useState<EnderecoCompleto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarCEP = useCallback(async (cep: string) => {
    if (!cep || cep.length < 8) return

    setLoading(true)
    setError(null)

    try {
      // Verifica cache primeiro
      const cacheKey = `cep_${cep.replace(/\D/g, '')}`
      const cached = CacheService.get<EnderecoCompleto>(cacheKey)
      
      if (cached) {
        setEndereco(cached)
        setLoading(false)
        return
      }

      const resultado = await CEPService.buscarCEP(cep)
      setEndereco(resultado)
      
      // Salva no cache
      CacheService.set(cacheKey, resultado)
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
  empresa: EmpresaInfo | null
  loading: boolean
  error: string | null
  buscarCNPJ: (cnpj: string) => Promise<void>
  limpar: () => void
}

export function useCNPJ(): UseCNPJReturn {
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarCNPJ = useCallback(async (cnpj: string) => {
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) return

    setLoading(true)
    setError(null)

    try {
      // Verifica cache primeiro
      const cacheKey = `cnpj_${cnpj.replace(/\D/g, '')}`
      const cached = CacheService.get<EmpresaInfo>(cacheKey)
      
      if (cached) {
        setEmpresa(cached)
        setLoading(false)
        return
      }

      const resultado = await CNPJService.buscarCNPJ(cnpj)
      setEmpresa(resultado)
      
      // Salva no cache
      CacheService.set(cacheKey, resultado)
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
// HOOK PARA ESTADOS
// ============================================

interface UseEstadosReturn {
  estados: Estado[]
  loading: boolean
  error: string | null
  recarregar: () => Promise<void>
}

export function useEstados(): UseEstadosReturn {
  const [estados, setEstados] = useState<Estado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const buscarEstados = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Verifica cache primeiro
      const cached = CacheService.get<Estado[]>('estados')
      
      if (cached) {
        setEstados(cached)
        setLoading(false)
        return
      }

      const resultado = await IBGEService.buscarEstados()
      setEstados(resultado)
      
      // Salva no cache por mais tempo (1 hora)
      CacheService.set('estados', resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar estados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    buscarEstados()
  }, [buscarEstados])

  return {
    estados,
    loading,
    error,
    recarregar: buscarEstados
  }
}

// ============================================
// HOOK PARA CIDADES
// ============================================

interface UseCidadesReturn {
  cidades: Cidade[]
  loading: boolean
  error: string | null
  buscarCidades: (uf: string) => Promise<void>
  limpar: () => void
}

export function useCidades(): UseCidadesReturn {
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarCidades = useCallback(async (uf: string) => {
    if (!uf) return

    setLoading(true)
    setError(null)

    try {
      // Verifica cache primeiro
      const cacheKey = `cidades_${uf}`
      const cached = CacheService.get<Cidade[]>(cacheKey)
      
      if (cached) {
        setCidades(cached)
        setLoading(false)
        return
      }

      const resultado = await IBGEService.buscarCidadesPorEstado(uf)
      setCidades(resultado)
      
      // Salva no cache
      CacheService.set(cacheKey, resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar cidades')
      setCidades([])
    } finally {
      setLoading(false)
    }
  }, [])

  const limpar = useCallback(() => {
    setCidades([])
    setError(null)
  }, [])

  return {
    cidades,
    loading,
    error,
    buscarCidades,
    limpar
  }
}

// ============================================
// HOOK COMBINADO PARA FORMULÁRIOS
// ============================================

interface UseFormularioEnderecoReturn {
  // Estados
  endereco: EnderecoCompleto | null
  empresa: EmpresaInfo | null
  estados: Estado[]
  cidades: Cidade[]
  
  // Loading states
  loadingCEP: boolean
  loadingCNPJ: boolean
  loadingEstados: boolean
  loadingCidades: boolean
  
  // Errors
  errorCEP: string | null
  errorCNPJ: string | null
  errorEstados: string | null
  errorCidades: string | null
  
  // Actions
  buscarPorCEP: (cep: string) => Promise<void>
  buscarPorCNPJ: (cnpj: string) => Promise<void>
  selecionarEstado: (uf: string) => Promise<void>
  limparTudo: () => void
}

export function useFormularioEndereco(): UseFormularioEnderecoReturn {
  const cepHook = useCEP()
  const cnpjHook = useCNPJ()
  const estadosHook = useEstados()
  const cidadesHook = useCidades()

  const buscarPorCEP = useCallback(async (cep: string) => {
    await cepHook.buscarCEP(cep)
    
    // Se encontrou o endereço, busca as cidades do estado automaticamente
    if (cepHook.endereco?.estado) {
      await cidadesHook.buscarCidades(cepHook.endereco.estado)
    }
  }, [cepHook, cidadesHook])

  const buscarPorCNPJ = useCallback(async (cnpj: string) => {
    await cnpjHook.buscarCNPJ(cnpj)
    
    // Se encontrou a empresa, busca as cidades do estado automaticamente
    if (cnpjHook.empresa?.endereco.uf) {
      await cidadesHook.buscarCidades(cnpjHook.empresa.endereco.uf)
    }
  }, [cnpjHook, cidadesHook])

  const selecionarEstado = useCallback(async (uf: string) => {
    await cidadesHook.buscarCidades(uf)
  }, [cidadesHook])

  const limparTudo = useCallback(() => {
    cepHook.limpar()
    cnpjHook.limpar()
    cidadesHook.limpar()
  }, [cepHook, cnpjHook, cidadesHook])

  return {
    // Estados
    endereco: cepHook.endereco,
    empresa: cnpjHook.empresa,
    estados: estadosHook.estados,
    cidades: cidadesHook.cidades,
    
    // Loading states
    loadingCEP: cepHook.loading,
    loadingCNPJ: cnpjHook.loading,
    loadingEstados: estadosHook.loading,
    loadingCidades: cidadesHook.loading,
    
    // Errors
    errorCEP: cepHook.error,
    errorCNPJ: cnpjHook.error,
    errorEstados: estadosHook.error,
    errorCidades: cidadesHook.error,
    
    // Actions
    buscarPorCEP,
    buscarPorCNPJ,
    selecionarEstado,
    limparTudo
  }
}
