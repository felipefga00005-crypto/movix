// ============================================
// SERVIÇOS PARA INTEGRAÇÃO COM APIS BRASILEIRAS
// ============================================

import { 
  CEPResponse, 
  EnderecoCompleto, 
  transformarCEPBrasilAPI, 
  transformarViaCEP,
  ViaCEPResponse,
  validarCEP 
} from '@/types/cep'

import { 
  CNPJResponse, 
  EmpresaInfo, 
  transformarCNPJResponse,
  validarCNPJ 
} from '@/types/cnpj'

import { 
  IBGEEstado, 
  IBGEMunicipio, 
  Estado, 
  Cidade,
  transformarEstadoIBGE,
  transformarMunicipioIBGE,
  ESTADOS_BRASILEIROS 
} from '@/types/ibge'

// ============================================
// CONFIGURAÇÕES DAS APIS
// ============================================

const API_BRASIL_BASE = 'https://brasilapi.com.br/api'
const VIA_CEP_BASE = 'https://viacep.com.br/ws'

// ============================================
// SERVIÇOS DE CEP
// ============================================

export class CEPService {
  /**
   * Busca endereço por CEP usando BrasilAPI (com fallback para ViaCEP)
   */
  static async buscarCEP(cep: string): Promise<EnderecoCompleto> {
    const validacao = validarCEP(cep)
    
    if (!validacao.isValid) {
      throw new Error(validacao.error || 'CEP inválido')
    }

    const cepLimpo = cep.replace(/\D/g, '')

    try {
      // Tenta primeiro com BrasilAPI (tem geolocalização)
      const response = await fetch(`${API_BRASIL_BASE}/cep/v2/${cepLimpo}`)
      
      if (response.ok) {
        const data: CEPResponse = await response.json()
        return transformarCEPBrasilAPI(data)
      }
    } catch (error) {
      console.warn('BrasilAPI CEP falhou, tentando ViaCEP:', error)
    }

    try {
      // Fallback para ViaCEP
      const response = await fetch(`${VIA_CEP_BASE}/${cepLimpo}/json/`)
      
      if (response.ok) {
        const data: ViaCEPResponse = await response.json()

        if (!data.cep || !data.logradouro) {
          throw new Error('CEP não encontrado')
        }
        
        return transformarViaCEP(data)
      }
    } catch (error) {
      console.error('ViaCEP também falhou:', error)
    }

    throw new Error('CEP não encontrado em nenhum provedor')
  }

  /**
   * Preenche automaticamente campos de endereço baseado no CEP
   */
  static async preencherEndereco(cep: string, callback: (endereco: EnderecoCompleto) => void) {
    try {
      const endereco = await this.buscarCEP(cep)
      callback(endereco)
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      throw error
    }
  }
}

// ============================================
// SERVIÇOS DE CNPJ
// ============================================

export class CNPJService {
  /**
   * Busca informações da empresa por CNPJ
   */
  static async buscarCNPJ(cnpj: string): Promise<EmpresaInfo> {
    const validacao = validarCNPJ(cnpj)
    
    if (!validacao.isValid) {
      throw new Error(validacao.error || 'CNPJ inválido')
    }

    const cnpjLimpo = cnpj.replace(/\D/g, '')

    try {
      const response = await fetch(`${API_BRASIL_BASE}/cnpj/v1/${cnpjLimpo}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('CNPJ não encontrado')
        }
        throw new Error('Erro ao consultar CNPJ')
      }

      const data: CNPJResponse = await response.json()
      return transformarCNPJResponse(data)
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error)
      throw error
    }
  }

  /**
   * Preenche automaticamente campos da empresa baseado no CNPJ
   */
  static async preencherEmpresa(cnpj: string, callback: (empresa: EmpresaInfo) => void) {
    try {
      const empresa = await this.buscarCNPJ(cnpj)
      callback(empresa)
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error)
      throw error
    }
  }
}

// ============================================
// SERVIÇOS DO IBGE
// ============================================

export class IBGEService {
  /**
   * Busca todos os estados
   */
  static async buscarEstados(): Promise<Estado[]> {
    try {
      const response = await fetch(`${API_BRASIL_BASE}/ibge/uf/v1`)
      
      if (!response.ok) {
        // Fallback para constante local
        return ESTADOS_BRASILEIROS
      }

      const data: IBGEEstado[] = await response.json()
      return data.map(transformarEstadoIBGE)
    } catch (error) {
      console.warn('Erro ao buscar estados da API, usando dados locais:', error)
      return ESTADOS_BRASILEIROS
    }
  }

  /**
   * Busca cidades por estado
   */
  static async buscarCidadesPorEstado(uf: string): Promise<Cidade[]> {
    try {
      const response = await fetch(`${API_BRASIL_BASE}/ibge/municipios/v1/${uf}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cidades')
      }

      const data: IBGEMunicipio[] = await response.json()
      return data.map(transformarMunicipioIBGE)
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)
      throw error
    }
  }

  /**
   * Busca informações de um estado específico
   */
  static async buscarEstado(codigo: string): Promise<Estado> {
    try {
      const response = await fetch(`${API_BRASIL_BASE}/ibge/uf/v1/${codigo}`)
      
      if (!response.ok) {
        throw new Error('Estado não encontrado')
      }

      const data: IBGEEstado = await response.json()
      return transformarEstadoIBGE(data)
    } catch (error) {
      console.error('Erro ao buscar estado:', error)
      throw error
    }
  }
}

// ============================================
// SERVIÇOS COMBINADOS
// ============================================

export class LocalizacaoService {
  /**
   * Busca endereço completo com validação de cidade/estado
   */
  static async buscarEnderecoCompleto(cep: string): Promise<EnderecoCompleto & { cidadeValida: boolean }> {
    const endereco = await CEPService.buscarCEP(cep)
    
    try {
      // Valida se a cidade existe no estado
      const cidades = await IBGEService.buscarCidadesPorEstado(endereco.estado)
      const cidadeValida = cidades.some(cidade => 
        cidade.nome.toLowerCase() === endereco.cidade.toLowerCase()
      )
      
      return {
        ...endereco,
        cidadeValida
      }
    } catch (error) {
      console.warn('Não foi possível validar cidade:', error)
      return {
        ...endereco,
        cidadeValida: true // Assume válida se não conseguir validar
      }
    }
  }
}

// ============================================
// UTILITÁRIOS DE CACHE
// ============================================

export class CacheService {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  static set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data as T
  }

  static clear(): void {
    this.cache.clear()
  }
}
