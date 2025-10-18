/**
 * Tipos relacionados a Empresa
 * Alinhado com backend/internal/models/empresa.go
 */

export interface Empresa {
  id: number

  // Dados Básicos
  razao_social: string
  nome_fantasia?: string
  cnpj: string
  inscricao_estadual?: string
  inscricao_municipal?: string

  // Endereço
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cep: string
  uf: string
  cidade_id: number
  cidade?: string

  // Contatos
  telefone?: string
  email?: string
  site?: string

  // Configurações Fiscais
  regime_tributario: number // 1=Simples Nacional, 2=Simples Nacional - excesso, 3=Regime Normal
  ambiente_nfe: number // 1=Produção, 2=Homologação
  serie_nfe: number
  serie_nfce: number
  proximo_numero_nfe: number
  proximo_numero_nfce: number

  // Certificado Digital
  certificado_a1?: string // Base64 do certificado
  senha_certificado?: string
  certificado_valido_ate?: string

  // Configurações SEFAZ
  csc_id?: number // Código de Segurança do Contribuinte - ID
  csc?: string // Código de Segurança do Contribuinte

  // Status
  ativo: boolean

  // Datas
  created_at: string
  updated_at: string
}

export interface CreateEmpresaRequest {
  // Dados Básicos
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string

  // Endereço
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cep: string
  uf: string
  cidadeId: number

  // Contatos
  telefone?: string
  email?: string
  site?: string

  // Configurações Fiscais
  regimeTributario: number
  ambienteNfe: number
  serieNfe: number
  serieNfce: number

  // Certificado Digital
  certificadoA1?: string
  senhaCertificado?: string

  // Configurações SEFAZ
  cscId?: number
  csc?: string

  // Status
  ativo?: boolean
}

export interface UpdateEmpresaRequest extends Partial<CreateEmpresaRequest> {
  id: number
}

export interface EmpresaStats {
  total: number
  ativas: number
  inativas: number
  comCertificado: number
  semCertificado: number
  certificadosVencendo: number // Próximos 30 dias
  certificadosVencidos: number
}

export interface CertificadoInfo {
  valido: boolean
  subject?: string
  issuer?: string
  validoAte?: Date
  diasParaVencer?: number
  temChavePrivada?: boolean
  erros: string[]
}

// Enums para facilitar o uso
export const RegimeTributario = {
  SIMPLES_NACIONAL: 1,
  SIMPLES_NACIONAL_EXCESSO: 2,
  REGIME_NORMAL: 3,
} as const

export const AmbienteNFe = {
  PRODUCAO: 1,
  HOMOLOGACAO: 2,
} as const

export const UFs = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const

export type UF = typeof UFs[number]
