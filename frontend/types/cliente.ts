/**
 * Tipos relacionados a Clientes
 * Alinhado com backend/internal/models/cliente.go
 */

export interface Cliente {
  id: number

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
  consumidor_final: boolean
  tipo_contato: string // Cliente, Fornecedor, Transportadora
  status: 'Ativo' | 'Inativo'

  // Contatos
  email?: string
  fone?: string
  celular?: string
  ponto_referencia?: string

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

  // Endereço de Entrega
  logradouro_entrega?: string
  numero_entrega?: string
  complemento_entrega?: string
  bairro_entrega?: string
  codigo_ibge_entrega?: string
  municipio_entrega?: string
  uf_entrega?: string
  cep_entrega?: string
  codigo_pais_entrega?: string
  pais_entrega?: string

  // Dados Financeiros
  limite_credito: number
  saldo_inicial: number
  prazo_pagamento: number

  // Datas
  data_nascimento?: string
  data_abertura?: string
  ultima_compra?: string
  created_at: string
  updated_at: string

  // Campos Personalizados
  campos_personalizados?: CampoPersonalizado[]
}

export interface CampoPersonalizado {
  id?: number
  nome: string
  valor: string
  ordem: number
}

export interface CreateClienteRequest {
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
  consumidorFinal?: boolean
  tipoContato?: string
  status?: string

  // Contatos
  email?: string
  fone?: string
  celular?: string
  pontoReferencia?: string

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

  // Endereço de Entrega
  logradouroEntrega?: string
  numeroEntrega?: string
  complementoEntrega?: string
  bairroEntrega?: string
  codigoIbgeEntrega?: string
  municipioEntrega?: string
  ufEntrega?: string
  cepEntrega?: string
  codigoPaisEntrega?: string
  paisEntrega?: string

  // Dados Financeiros
  limiteCredito?: number
  saldoInicial?: number
  prazoPagamento?: number

  // Datas
  dataNascimento?: string
  dataAbertura?: string

  // Campos Personalizados
  camposPersonalizados?: CampoPersonalizado[]
}

export interface ClienteStats {
  total: number
  ativos: number
  inativos: number
  pessoaFisica: number
  pessoaJuridica: number
}

