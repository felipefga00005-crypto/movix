/**
 * External API Service
 * Serviço para consultar APIs externas (CEP, CNPJ, IBGE)
 */

import { httpClient } from '../http-client'

// ============================================
// TIPOS
// ============================================

export interface EmpresaResponse {
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
  inscricao_estadual: string
  endereco: {
    cep: string
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
    codigo_ibge: string
  }
  contato: {
    email: string
    telefone: string
    telefone2?: string
  }
}

export interface EnderecoResponse {
  cep: string
  logradouro: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  codigo_ibge?: string
  latitude?: string
  longitude?: string
}

export interface EstadoResponse {
  id: number
  sigla: string
  nome: string
  regiao: {
    id: number
    sigla: string
    nome: string
  }
}

export interface CidadeResponse {
  nome: string
  codigo_ibge: string
}

// ============================================
// SERVIÇO
// ============================================

export const externalApiService = {
  /**
   * Busca dados de empresa por CNPJ
   */
  async buscarCNPJ(cnpj: string): Promise<EmpresaResponse> {
    // Remove formatação do CNPJ
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    return httpClient.get<EmpresaResponse>(`/cnpj/${cnpjLimpo}`)
  },

  /**
   * Busca endereço por CEP
   */
  async buscarCEP(cep: string): Promise<EnderecoResponse> {
    // Remove formatação do CEP
    const cepLimpo = cep.replace(/\D/g, '')
    return httpClient.get<EnderecoResponse>(`/cep/${cepLimpo}`)
  },

  /**
   * Lista todos os estados
   */
  async listarEstados(): Promise<EstadoResponse[]> {
    return httpClient.get<EstadoResponse[]>('/estados')
  },

  /**
   * Lista cidades por estado
   */
  async listarCidadesPorEstado(uf: string): Promise<CidadeResponse[]> {
    return httpClient.get<CidadeResponse[]>(`/estados/${uf}/cidades`)
  },

  /**
   * Busca localização completa (CEP + validação IBGE)
   */
  async buscarLocalizacaoCompleta(cep: string): Promise<{
    endereco: EnderecoResponse
    cidade_valida: boolean
  }> {
    const cepLimpo = cep.replace(/\D/g, '')
    return httpClient.get(`/localizacao/${cepLimpo}`)
  },

  /**
   * Busca dados para formulário (estados + CEP + cidades)
   */
  async buscarDadosFormulario(params?: {
    cep?: string
    uf?: string
  }): Promise<{
    estados: EstadoResponse[]
    endereco?: EnderecoResponse
    cidades?: CidadeResponse[]
    erro_cep?: string
    erro_cidades?: string
  }> {
    const queryParams = new URLSearchParams()
    if (params?.cep) queryParams.append('cep', params.cep)
    if (params?.uf) queryParams.append('uf', params.uf)

    const query = queryParams.toString()
    return httpClient.get(`/formulario/dados${query ? `?${query}` : ''}`)
  },
}

export default externalApiService

