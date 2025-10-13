// ============================================
// TIPOS PARA CONSULTA DE CNPJ
// ============================================

// Quadro de Sócios e Administradores
export interface QSA {
  pais?: string
  nome_socio: string
  codigo_pais?: number
  faixa_etaria: string
  cnpj_cpf_do_socio: string
  qualificacao_socio: string
  codigo_faixa_etaria: number
  data_entrada_sociedade: string
  identificador_de_socio: 1 | 2 | 3 // 1=PJ, 2=PF, 3=ESTRANGEIRO
  cpf_representante_legal?: string
  nome_representante_legal?: string
  codigo_qualificacao_socio: number
  qualificacao_representante_legal: string
  codigo_qualificacao_representante_legal: number
}

// CNAEs Secundários
export interface CNAESecundario {
  codigo: number
  descricao: string
}

// Regime Tributário
export interface RegimeTributario {
  ano?: number
  cnpj_da_scp?: string
  forma_de_tributacao: string
  quantidade_de_escrituracoes: number
}

// Resposta completa da API de CNPJ
export interface CNPJResponse {
  uf: string
  cep: number
  qsa: QSA[]
  cnpj: string
  pais?: string
  email?: string
  porte: "NÃO INFORMADO" | "MICRO EMPRESA" | "EMPRESA DE PEQUENO PORTE" | "DEMAIS"
  bairro: string
  numero: string
  ddd_fax?: string
  municipio?: string
  logradouro: string
  cnae_fiscal: number
  codigo_pais?: number
  complemento: string
  codigo_porte: 0 | 1 | 3 | 5
  razao_social: string
  nome_fantasia: string
  capital_social: number
  ddd_telefone_1: string
  ddd_telefone_2?: string
  opcao_pelo_mei?: boolean
  codigo_municipio?: number
  cnaes_secundarios: CNAESecundario[]
  natureza_juridica: string
  regime_tributario?: RegimeTributario[]
  situacao_especial?: string
  opcao_pelo_simples?: boolean
  situacao_cadastral: 1 | 2 | 3 | 4 | 8 // 1=NULA, 2=ATIVA, 3=SUSPENSA, 4=INAPTA, 8=BAIXADA
  data_opcao_pelo_mei?: string
  data_exclusao_do_mei?: string
  cnae_fiscal_descricao: string
  codigo_municipio_ibge: number
  data_inicio_atividade: string
  data_situacao_especial?: string
  data_opcao_pelo_simples?: string
  data_situacao_cadastral: string
  nome_cidade_exterior?: string
  codigo_natureza_juridica: number
  data_exclusao_do_simples?: string
  motivo_situacao_cadastral: number
  ente_federativo_responsavel: string
  identificador_matriz_filial: 1 | 2 // 1=MATRIZ, 2=FILIAL
  qualificacao_do_responsavel: number
  descricao_situacao_cadastral: "NULA" | "ATIVA" | "SUSPENSA" | "INAPTA" | "BAIXADA"
  descricao_tipo_de_logradouro: string
  descricao_motivo_situacao_cadastral: string
  descricao_matriz_filial: "MATRIZ" | "FILIAL"
}

// Tipo simplificado para uso na aplicação
export interface EmpresaInfo {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  situacao: "ATIVA" | "INATIVA" | "SUSPENSA" | "INAPTA" | "BAIXADA"
  tipoEstabelecimento: "MATRIZ" | "FILIAL"
  dataAbertura: string
  cnaePrincipal: {
    codigo: number
    descricao: string
  }
  naturezaJuridica: string
  porte: string
  regimeTributario?: string
  optanteSimples?: boolean
  optanteMEI?: boolean
  capitalSocial: number
  endereco: {
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    uf: string
    cep: string
  }
  contato: {
    telefone?: string
    telefone2?: string
    fax?: string
    email?: string
  }
  socios: Array<{
    nome: string
    qualificacao: string
    participacao?: string
  }>
}

// ============================================
// TIPOS PARA VALIDAÇÃO
// ============================================

export interface CNPJValidation {
  isValid: boolean
  formatted: string
  error?: string
}

// ============================================
// UTILITÁRIOS PARA CNPJ
// ============================================

export const formatarCNPJ = (cnpj: string): string => {
  const apenasNumeros = cnpj.replace(/\D/g, '')
  if (apenasNumeros.length === 14) {
    return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5, 8)}/${apenasNumeros.slice(8, 12)}-${apenasNumeros.slice(12)}`
  }
  return cnpj
}

export const limparCNPJ = (cnpj: string): string => {
  return cnpj.replace(/\D/g, '')
}

export const validarCNPJ = (cnpj: string): CNPJValidation => {
  const cnpjLimpo = limparCNPJ(cnpj)
  
  if (cnpjLimpo.length !== 14) {
    return {
      isValid: false,
      formatted: cnpj,
      error: "CNPJ deve conter exatamente 14 dígitos"
    }
  }
  
  // Validação básica de dígitos verificadores
  if (!validarDigitosCNPJ(cnpjLimpo)) {
    return {
      isValid: false,
      formatted: cnpj,
      error: "CNPJ inválido"
    }
  }
  
  return {
    isValid: true,
    formatted: formatarCNPJ(cnpjLimpo)
  }
}

const validarDigitosCNPJ = (cnpj: string): boolean => {
  if (cnpj.length !== 14) return false
  
  // Elimina CNPJs conhecidos como inválidos
  if (/^(\d)\1{13}$/.test(cnpj)) return false
  
  // Validação do primeiro dígito verificador
  let soma = 0
  let peso = 2
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cnpj[i]) * peso
    peso = peso === 9 ? 2 : peso + 1
  }
  const digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  
  if (parseInt(cnpj[12]) !== digito1) return false
  
  // Validação do segundo dígito verificador
  soma = 0
  peso = 2
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpj[i]) * peso
    peso = peso === 9 ? 2 : peso + 1
  }
  const digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  
  return parseInt(cnpj[13]) === digito2
}

// ============================================
// TRANSFORMADOR DE RESPOSTA
// ============================================

export const transformarCNPJResponse = (response: CNPJResponse): EmpresaInfo => ({
  cnpj: formatarCNPJ(response.cnpj),
  razaoSocial: response.razao_social,
  nomeFantasia: response.nome_fantasia,
  situacao: response.descricao_situacao_cadastral === "ATIVA" ? "ATIVA" : "INATIVA",
  tipoEstabelecimento: response.descricao_matriz_filial,
  dataAbertura: response.data_inicio_atividade,
  cnaePrincipal: {
    codigo: response.cnae_fiscal,
    descricao: response.cnae_fiscal_descricao
  },
  naturezaJuridica: response.natureza_juridica,
  porte: response.porte,
  regimeTributario: response.regime_tributario?.[0]?.forma_de_tributacao,
  optanteSimples: response.opcao_pelo_simples,
  optanteMEI: response.opcao_pelo_mei,
  capitalSocial: response.capital_social,
  endereco: {
    logradouro: response.logradouro,
    numero: response.numero,
    complemento: response.complemento,
    bairro: response.bairro,
    cidade: response.municipio || "",
    uf: response.uf,
    cep: response.cep.toString().padStart(8, '0')
  },
  contato: {
    telefone: response.ddd_telefone_1,
    telefone2: response.ddd_telefone_2,
    fax: response.ddd_fax,
    email: response.email
  },
  socios: response.qsa.map(socio => ({
    nome: socio.nome_socio,
    qualificacao: socio.qualificacao_socio,
    participacao: undefined // Não disponível na API
  }))
})

// ============================================
// CONSTANTES
// ============================================

export const CNPJ_PROVIDERS = {
  BRASIL_API: 'brasilapi',
  RECEITA_WS: 'receitaws'
} as const

export type CNPJProvider = typeof CNPJ_PROVIDERS[keyof typeof CNPJ_PROVIDERS]

export const SITUACAO_CADASTRAL = {
  1: "NULA",
  2: "ATIVA",
  3: "SUSPENSA",
  4: "INAPTA",
  8: "BAIXADA"
} as const

export const IDENTIFICADOR_MATRIZ_FILIAL = {
  1: "MATRIZ",
  2: "FILIAL"
} as const
