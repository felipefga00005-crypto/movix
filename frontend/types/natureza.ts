/**
 * Tipos relacionados a Natureza de Operação
 * Alinhado com backend/internal/models/natureza_operacao.go
 */

export interface NaturezaOperacao {
  id: number

  // Identificação
  codigo: string
  descricao: string

  // CFOPs
  cfop_dentro_estado: string
  cfop_fora_estado: string
  cfop_exterior?: string

  // Configurações NFe
  finalidade_nfe: number // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
  tipo_operacao: number // 0=Entrada, 1=Saída
  consumidor_final: boolean
  presenca_comprador: number // 0=Não se aplica, 1=Presencial, 2=Internet, 3=Teleatendimento, 4=NFCe entrega domicílio, 5=Presencial fora estabelecimento, 9=Operação não presencial

  // Tributação
  calcular_icms: boolean
  calcular_ipi: boolean
  calcular_pis: boolean
  calcular_cofins: boolean

  // Observações
  observacoes?: string
  informacoes_adicionais?: string

  // Status
  ativo: boolean
  padrao: boolean // Se é a natureza padrão para vendas

  // Datas
  created_at: string
  updated_at: string
}

export interface CreateNaturezaRequest {
  // Identificação
  codigo: string
  descricao: string

  // CFOPs
  cfopDentroEstado: string
  cfopForaEstado: string
  cfopExterior?: string

  // Configurações NFe
  finalidadeNfe: number
  tipoOperacao: number
  consumidorFinal: boolean
  presencaComprador: number

  // Tributação
  calcularIcms: boolean
  calcularIpi: boolean
  calcularPis: boolean
  calcularCofins: boolean

  // Observações
  observacoes?: string
  informacoesAdicionais?: string

  // Status
  ativo?: boolean
  padrao?: boolean
}

export interface UpdateNaturezaRequest extends Partial<CreateNaturezaRequest> {
  id: number
}

export interface NaturezaStats {
  total: number
  ativas: number
  inativas: number
  porTipoOperacao: Record<string, number>
  porFinalidade: Record<string, number>
}

// Enums para facilitar o uso
export const FinalidadeNFe = {
  NORMAL: 1,
  COMPLEMENTAR: 2,
  AJUSTE: 3,
  DEVOLUCAO: 4,
} as const

export const TipoOperacao = {
  ENTRADA: 0,
  SAIDA: 1,
} as const

export const PresencaComprador = {
  NAO_SE_APLICA: 0,
  PRESENCIAL: 1,
  INTERNET: 2,
  TELEATENDIMENTO: 3,
  NFCE_ENTREGA_DOMICILIO: 4,
  PRESENCIAL_FORA_ESTABELECIMENTO: 5,
  OPERACAO_NAO_PRESENCIAL: 9,
} as const

// CFOPs mais comuns
export const CFOPs = {
  // Vendas dentro do estado
  VENDA_DENTRO_ESTADO: '5102',
  VENDA_CONSUMIDOR_FINAL_DENTRO_ESTADO: '5405',
  
  // Vendas fora do estado
  VENDA_FORA_ESTADO: '6102',
  VENDA_CONSUMIDOR_FINAL_FORA_ESTADO: '6405',
  
  // Devoluções
  DEVOLUCAO_COMPRA_DENTRO_ESTADO: '5202',
  DEVOLUCAO_COMPRA_FORA_ESTADO: '6202',
  
  // Remessas
  REMESSA_CONSERTO_DENTRO_ESTADO: '5915',
  REMESSA_CONSERTO_FORA_ESTADO: '6915',
} as const

export const CFOPDescricoes: Record<string, string> = {
  '5102': 'Venda de mercadoria adquirida ou recebida de terceiros',
  '5405': 'Venda de mercadoria adquirida ou recebida de terceiros - Consumidor final',
  '6102': 'Venda de mercadoria adquirida ou recebida de terceiros - Fora do estado',
  '6405': 'Venda de mercadoria adquirida ou recebida de terceiros - Consumidor final fora do estado',
  '5202': 'Devolução de compra para comercialização',
  '6202': 'Devolução de compra para comercialização - Fora do estado',
  '5915': 'Remessa para conserto ou reparo',
  '6915': 'Remessa para conserto ou reparo - Fora do estado',
}
