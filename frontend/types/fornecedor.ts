/**
 * Tipos relacionados a Fornecedores
 * Alinhado com backend/internal/models/fornecedor.go
 */

export interface Fornecedor {
  id: number

  // Código Interno
  codigo: string

  // Identificação Fiscal
  tipo_pessoa: 'PF' | 'PJ'
  cnpj_cpf: string
  ie?: string
  im?: string
  ind_ie_dest: number // 1=Contribuinte, 2=Isento, 9=Não Contribuinte

  // Dados Cadastrais
  razao_social: string
  nome_fantasia?: string

  // Classificação e Status
  categoria: string // Distribuidor, Fabricante, Importador, Prestador de Serviço
  status: 'Ativo' | 'Inativo' | 'Bloqueado' | 'Pendente'

  // Contatos
  email?: string
  fone?: string
  celular?: string
  site?: string
  ponto_referencia?: string

  // Contato Principal
  nome_contato?: string
  cargo_contato?: string
  telefone_contato?: string
  email_contato?: string

  // Endereço Principal
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  codigo_ibge?: string
  municipio?: string
  uf?: string
  cep?: string
  codigo_pais?: string
  pais?: string

  // Dados Comerciais
  prazo_pagamento: number // Prazo médio em dias
  limite_compra: number
  desconto_negociado: number // % de desconto
  frete_minimo: number
  pedido_minimo: number
  prazo_entrega: number // Prazo médio de entrega em dias

  // Dados Bancários
  banco?: string
  agencia?: string
  conta?: string
  tipo_conta?: string // Corrente, Poupança
  pix?: string

  // Observações
  observacoes?: string
  anotacoes?: string

  // Datas
  data_abertura?: string
  ultima_compra?: string
  proximo_contato?: string
  created_at: string
  updated_at: string
  deleted_at?: string

  // Campos Personalizados
  campos_personalizados?: FornecedorCampoPersonalizado[]
}

export interface FornecedorCampoPersonalizado {
  id?: number
  fornecedor_id: number
  nome: string
  valor: string
  ordem: number
  created_at?: string
  updated_at?: string
}

export interface CreateFornecedorRequest {
  // Identificação Fiscal
  tipoPessoa: 'PF' | 'PJ'
  cnpjCpf: string
  ie?: string
  im?: string
  indIeDest?: number

  // Dados Cadastrais
  razaoSocial: string
  nomeFantasia?: string

  // Classificação
  categoria?: string
  status?: string

  // Contatos
  email?: string
  fone?: string
  celular?: string
  site?: string
  pontoReferencia?: string

  // Contato Principal
  nomeContato?: string
  cargoContato?: string
  telefoneContato?: string
  emailContato?: string

  // Endereço Principal
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  codigoIbge?: string
  municipio?: string
  uf?: string
  cep?: string
  codigoPais?: string
  pais?: string

  // Dados Comerciais
  prazoPagamento?: number
  limiteCompra?: number
  descontoNegociado?: number
  freteMinimo?: number
  pedidoMinimo?: number
  prazoEntrega?: number

  // Dados Bancários
  banco?: string
  agencia?: string
  conta?: string
  tipoConta?: string
  pix?: string

  // Observações
  observacoes?: string
  anotacoes?: string

  // Datas
  dataAbertura?: string
  proximoContato?: string

  // Campos Personalizados
  camposPersonalizados?: FornecedorCampoPersonalizadoDTO[]
}

export interface UpdateFornecedorRequest {
  // Identificação Fiscal
  tipoPessoa?: 'PF' | 'PJ'
  cnpjCpf?: string
  ie?: string
  im?: string
  indIeDest?: number

  // Dados Cadastrais
  razaoSocial?: string
  nomeFantasia?: string

  // Classificação
  categoria?: string
  status?: string

  // Contatos
  email?: string
  fone?: string
  celular?: string
  site?: string
  pontoReferencia?: string

  // Contato Principal
  nomeContato?: string
  cargoContato?: string
  telefoneContato?: string
  emailContato?: string

  // Endereço Principal
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  codigoIbge?: string
  municipio?: string
  uf?: string
  cep?: string
  codigoPais?: string
  pais?: string

  // Dados Comerciais
  prazoPagamento?: number
  limiteCompra?: number
  descontoNegociado?: number
  freteMinimo?: number
  pedidoMinimo?: number
  prazoEntrega?: number

  // Dados Bancários
  banco?: string
  agencia?: string
  conta?: string
  tipoConta?: string
  pix?: string

  // Observações
  observacoes?: string
  anotacoes?: string

  // Datas
  dataAbertura?: string
  proximoContato?: string

  // Campos Personalizados
  camposPersonalizados?: FornecedorCampoPersonalizadoDTO[]
}

export interface FornecedorCampoPersonalizadoDTO {
  id?: number
  nome: string
  valor: string
  ordem: number
}

export interface FornecedorStats {
  total: number
  ativos: number
  inativos: number
  bloqueados: number
  pendentes: number
  porCategoria?: Record<string, number>
  valorTotalCompras?: number
  fornecedoresComContrato?: number
}

// Tipos auxiliares para filtros e busca
export interface FornecedorFilters {
  status?: string[]
  categoria?: string[]
  tipoPessoa?: string[]
  temContrato?: boolean
  temDadosBancarios?: boolean
}

export interface FornecedorSearchParams {
  query?: string
  filters?: FornecedorFilters
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
