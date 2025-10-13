// ============================================
// TIPOS PARA CONSULTA DE CEP
// ============================================

// Resposta da BrasilAPI CEP v2 (com geolocalização)
export interface CEPResponse {
  cep: string
  state: string
  city: string
  district: string
  street: string
  service: string
  location?: {
    type: "Point"
    coordinates: {
      longitude: string
      latitude: string
    }
  }
}

// Resposta da ViaCEP (fallback)
export interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
}

// Tipo unificado para uso na aplicação
export interface EnderecoCompleto {
  cep: string
  logradouro: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  codigoIbge?: string
  latitude?: string
  longitude?: string
  ddd?: string
}

// ============================================
// TIPOS PARA VALIDAÇÃO
// ============================================

export interface CEPValidation {
  isValid: boolean
  formatted: string
  error?: string
}

// ============================================
// UTILITÁRIOS PARA CEP
// ============================================

export const formatarCEP = (cep: string): string => {
  const apenasNumeros = cep.replace(/\D/g, '')
  if (apenasNumeros.length === 8) {
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`
  }
  return cep
}

export const limparCEP = (cep: string): string => {
  return cep.replace(/\D/g, '')
}

export const validarCEP = (cep: string): CEPValidation => {
  const cepLimpo = limparCEP(cep)
  
  if (cepLimpo.length !== 8) {
    return {
      isValid: false,
      formatted: cep,
      error: "CEP deve conter exatamente 8 dígitos"
    }
  }
  
  if (!/^\d{8}$/.test(cepLimpo)) {
    return {
      isValid: false,
      formatted: cep,
      error: "CEP deve conter apenas números"
    }
  }
  
  return {
    isValid: true,
    formatted: formatarCEP(cepLimpo)
  }
}

// ============================================
// TRANSFORMADORES DE RESPOSTA
// ============================================

export const transformarCEPBrasilAPI = (response: CEPResponse): EnderecoCompleto => ({
  cep: formatarCEP(response.cep),
  logradouro: response.street,
  bairro: response.district,
  cidade: response.city,
  estado: response.state,
  latitude: response.location?.coordinates.latitude,
  longitude: response.location?.coordinates.longitude
})

export const transformarViaCEP = (response: ViaCEPResponse): EnderecoCompleto => ({
  cep: formatarCEP(response.cep),
  logradouro: response.logradouro,
  complemento: response.complemento,
  bairro: response.bairro,
  cidade: response.localidade,
  estado: response.uf,
  codigoIbge: response.ibge,
  ddd: response.ddd
})

// ============================================
// CONSTANTES
// ============================================

export const CEP_PROVIDERS = {
  BRASIL_API: 'brasilapi',
  VIA_CEP: 'viacep'
} as const

export type CEPProvider = typeof CEP_PROVIDERS[keyof typeof CEP_PROVIDERS]
