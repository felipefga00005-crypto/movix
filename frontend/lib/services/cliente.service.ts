import { api } from '../api';

export interface CampoPersonalizado {
  id?: number;
  nome: string;
  valor: string;
  ordem: number;
}

export interface Cliente {
  id: number;
  cpf: string;
  ie_rg: string;
  inscricao_municipal: string;
  nome: string;
  nome_fantasia: string;
  tipo_contato: string;
  consumidor_final: boolean;
  email: string;
  ponto_referencia: string;
  telefone_fixo: string;
  telefone_alternativo: string;
  celular: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  codigo_ibge: string;
  cep_entrega: string;
  endereco_entrega: string;
  numero_entrega: string;
  complemento_entrega: string;
  bairro_entrega: string;
  cidade_entrega: string;
  estado_entrega: string;
  limite_credito: string;
  saldo_inicial: string;
  prazo_pagamento: string;
  data_nascimento: string;
  data_abertura: string;
  status: string;
  data_cadastro: string;
  ultima_compra: string;
  data_atualizacao: string;
  camposPersonalizados?: CampoPersonalizado[];
}

export interface CreateClienteRequest {
  cpf: string;
  ieRg?: string;
  inscricaoMunicipal?: string;
  nome: string;
  nomeFantasia?: string;
  tipoContato?: string;
  consumidorFinal?: boolean;
  email?: string;
  pontoReferencia?: string;
  telefoneFixo?: string;
  telefoneAlternativo?: string;
  celular?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  codigoIbge?: string;
  cepEntrega?: string;
  enderecoEntrega?: string;
  numeroEntrega?: string;
  complementoEntrega?: string;
  bairroEntrega?: string;
  cidadeEntrega?: string;
  estadoEntrega?: string;
  limiteCredito?: string;
  saldoInicial?: string;
  prazoPagamento?: string;
  dataNascimento?: string;
  dataAbertura?: string;
  status?: string;
  camposPersonalizados?: CampoPersonalizado[];
}

export interface UpdateClienteRequest extends Partial<CreateClienteRequest> {}

export interface ClienteStats {
  total: number;
  ativos: number;
  inativos: number;
  novos_mes: number;
}

class ClienteService {
  private readonly basePath = '/clientes';

  async getAll(): Promise<Cliente[]> {
    return api.get<Cliente[]>(this.basePath);
  }

  async getById(id: number): Promise<Cliente> {
    return api.get<Cliente>(`${this.basePath}/${id}`);
  }

  async create(data: CreateClienteRequest): Promise<Cliente> {
    return api.post<Cliente>(this.basePath, data);
  }

  async update(id: number, data: UpdateClienteRequest): Promise<Cliente> {
    return api.put<Cliente>(`${this.basePath}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  async getByStatus(status: string): Promise<Cliente[]> {
    return api.get<Cliente[]>(`${this.basePath}/status?status=${status}`);
  }

  async search(query: string): Promise<Cliente[]> {
    return api.get<Cliente[]>(`${this.basePath}/search?q=${encodeURIComponent(query)}`);
  }

  async getStats(): Promise<ClienteStats> {
    return api.get<ClienteStats>(`${this.basePath}/stats`);
  }
}

export const clienteService = new ClienteService();

