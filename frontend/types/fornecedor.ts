export interface Fornecedor {
  id: number
  codigo: string
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
  uf?: string
  cep?: string
  status: FornecedorStatus
  categoria?: string
  contato?: string
  dataCadastro: string
  dataAtualizacao: string
}

export enum FornecedorStatus {
  ATIVO = "Ativo",
  INATIVO = "Inativo", 
  PENDENTE = "Pendente"
}

export enum FornecedorCategoria {
  DISTRIBUIDOR = "Distribuidor",
  FABRICANTE = "Fabricante",
  IMPORTADOR = "Importador",
  PRESTADOR_SERVICO = "Prestador de Serviço",
  OUTROS = "Outros"
}

export interface CreateFornecedorRequest {
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
  uf?: string
  cep?: string
  status?: FornecedorStatus
  categoria?: string
  contato?: string
}

export interface UpdateFornecedorRequest {
  razaoSocial?: string
  nomeFantasia?: string
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
  uf?: string
  cep?: string
  status?: FornecedorStatus
  categoria?: string
  contato?: string
}

export interface FornecedorStats {
  total: number
  ativos: number
  inativos: number
  pendentes: number
  porCategoria: Record<string, number>
}
