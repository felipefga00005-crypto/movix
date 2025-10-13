// ============================================
// API EXTERNA - Serviços de CEP, CNPJ, IBGE
// ============================================

import { apiClient } from "./client"

// ============================================
// TIPOS
// ============================================

export interface Endereco {
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

export interface Empresa {
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

export interface Estado {
  id: number
  sigla: string
  nome: string
  regiao: {
    id: number
    sigla: string
    nome: string
  }
}

export interface Cidade {
  nome: string
  codigo_ibge: string
}

export interface FormularioData {
  endereco?: Endereco
  empresa?: Empresa
  estados: Estado[]
  cidades?: Cidade[]
  erro_cep?: string
  erro_cnpj?: string
  erro_cidades?: string
}

// ============================================
// SERVIÇOS
// ============================================

export const externalApisService = {
  // Buscar endereço por CEP
  async buscarCEP(cep: string): Promise<Endereco> {
    const cepLimpo = cep.replace(/\D/g, '')
    return apiClient.get<Endereco>(`/cep/${cepLimpo}`)
  },

  // Buscar empresa por CNPJ
  async buscarCNPJ(cnpj: string): Promise<Empresa> {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    return apiClient.get<Empresa>(`/cnpj/${cnpjLimpo}`)
  },

  // Listar todos os estados
  async buscarEstados(): Promise<Estado[]> {
    return apiClient.get<Estado[]>('/estados')
  },

  // Listar cidades por estado
  async buscarCidades(uf: string): Promise<Cidade[]> {
    return apiClient.get<Cidade[]>(`/estados/${uf}/cidades`)
  },

  // Buscar localização completa (CEP + validação IBGE)
  async buscarLocalizacaoCompleta(cep: string): Promise<{
    endereco: Endereco
    cidade_valida: boolean
    validado_ibge: boolean
  }> {
    const cepLimpo = cep.replace(/\D/g, '')
    return apiClient.get(`/localizacao/${cepLimpo}`)
  },

  // Endpoint combinado para formulários
  async buscarDadosFormulario(params: {
    cep?: string
    uf?: string
  }): Promise<FormularioData> {
    return apiClient.get('/formulario/dados', params)
  },
}
