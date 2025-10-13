// Tipos baseados no modelo Cliente do backend Go

export interface Cliente {
  id: number;
  codigo: string;
  
  // Dados Básicos
  cpf: string;
  ieRg?: string; // RG para PF ou IE para PJ
  inscricaoMunicipal?: string;
  nome: string;
  nomeFantasia?: string;
  tipoContato: string; // 'Cliente', 'Fornecedor', etc.
  consumidorFinal: boolean;
  
  // Contatos
  email?: string;
  pontoReferencia?: string;
  telefoneFixo?: string;
  telefoneAlternativo?: string;
  celular?: string;
  
  // Endereço Principal
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  
  // Endereço de Entrega
  cepEntrega?: string;
  enderecoEntrega?: string;
  numeroEntrega?: string;
  complementoEntrega?: string;
  bairroEntrega?: string;
  cidadeEntrega?: string;
  estadoEntrega?: string;
  
  // Dados Financeiros
  limiteCredito?: string;
  saldoInicial?: string;
  prazoPagamento?: string;
  
  // Campos de Sistema
  dataNascimento?: string;
  dataAbertura?: string;
  status: string; // 'Ativo', 'Inativo', 'Pendente'
  ultimaCompra?: string;
  observacoes?: string;
  
  // Timestamps
  dataCadastro: string;
  dataAtualizacao: string;
  
  // Relacionamentos
  camposPersonalizados?: ClienteCampoPersonalizado[];
}

export interface ClienteCampoPersonalizado {
  id: number;
  clienteId: number;
  nome: string;
  valor: string;
  ordem: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteRequest {
  // Dados Básicos (obrigatórios)
  cpf: string;
  nome: string;
  
  // Dados Básicos (opcionais)
  ieRg?: string;
  inscricaoMunicipal?: string;
  nomeFantasia?: string;
  tipoContato?: string;
  consumidorFinal?: boolean;
  
  // Contatos
  email?: string;
  pontoReferencia?: string;
  telefoneFixo?: string;
  telefoneAlternativo?: string;
  celular?: string;
  
  // Endereço Principal
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  
  // Endereço de Entrega
  cepEntrega?: string;
  enderecoEntrega?: string;
  numeroEntrega?: string;
  complementoEntrega?: string;
  bairroEntrega?: string;
  cidadeEntrega?: string;
  estadoEntrega?: string;
  
  // Dados Financeiros
  limiteCredito?: string;
  saldoInicial?: string;
  prazoPagamento?: string;
  
  // Campos de Sistema
  dataNascimento?: string;
  dataAbertura?: string;
  status?: string;
  observacoes?: string;
  
  // Campos Personalizados
  camposPersonalizados?: CampoPersonalizadoDTO[];
}

export interface UpdateClienteRequest {
  // Todos os campos são opcionais para update
  cpf?: string;
  ieRg?: string;
  inscricaoMunicipal?: string;
  nome?: string;
  nomeFantasia?: string;
  tipoContato?: string;
  consumidorFinal?: boolean;
  
  // Contatos
  email?: string;
  pontoReferencia?: string;
  telefoneFixo?: string;
  telefoneAlternativo?: string;
  celular?: string;
  
  // Endereço Principal
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  
  // Endereço de Entrega
  cepEntrega?: string;
  enderecoEntrega?: string;
  numeroEntrega?: string;
  complementoEntrega?: string;
  bairroEntrega?: string;
  cidadeEntrega?: string;
  estadoEntrega?: string;
  
  // Dados Financeiros
  limiteCredito?: string;
  saldoInicial?: string;
  prazoPagamento?: string;
  
  // Campos de Sistema
  dataNascimento?: string;
  dataAbertura?: string;
  status?: string;
  ultimaCompra?: string;
  observacoes?: string;
  
  // Campos Personalizados
  camposPersonalizados?: CampoPersonalizadoDTO[];
}

export interface CampoPersonalizadoDTO {
  nome: string;
  valor: string;
  ordem?: number;
}

// Tipos para respostas da API
export interface ClienteResponse {
  data: Cliente;
  message?: string;
}

export interface ClientesResponse {
  data: Cliente[];
  message?: string;
}

export interface ClienteStats {
  total: number;
  ativos: number;
  inativos: number;
  porTipoContato: Record<string, number>;
}

export interface ClienteStatsResponse {
  data: ClienteStats;
  message?: string;
}

// Tipos para filtros e busca
export interface ClienteFilters {
  status?: string;
  tipoContato?: string;
  cidade?: string;
  estado?: string;
  search?: string;
}

export interface ClienteSearchParams {
  page?: number;
  limit?: number;
  filters?: ClienteFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipos para formulários
export interface ClienteFormData extends Omit<CreateClienteRequest, 'camposPersonalizados'> {
  camposPersonalizados: CampoPersonalizadoDTO[];
}

// Tipos para validação
export interface ClienteValidationErrors {
  cpf?: string;
  nome?: string;
  email?: string;
  telefoneFixo?: string;
  cep?: string;
  endereco?: string;
  [key: string]: string | undefined;
}

// Enums para valores fixos
export enum ClienteStatus {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo',
  PENDENTE = 'Pendente'
}

export enum TipoContato {
  CLIENTE = 'Cliente',
  FORNECEDOR = 'Fornecedor',
  AMBOS = 'Ambos'
}

// Tipos para integração com APIs externas
export interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface EmpresaReceitaWS {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  dataAbertura: string;
  naturezaJuridica: string;
  porte: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    municipio: string;
    uf: string;
  };
  telefone: string;
  email: string;
}
