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

  // Converte snake_case para camelCase para o backend
  private transformToBackend(data: any): any {
    return {
      tipoPessoa: data.tipoPessoa || 'PF',
      cnpjCpf: data.cpf || data.cnpjCpf,
      ie: data.ieRg || data.ie || '',
      im: data.inscricaoMunicipal || data.im || '',
      indIeDest: data.indIeDest || 9,
      razaoSocial: data.nome || data.razaoSocial,
      nomeFantasia: data.nomeFantasia || data.nome_fantasia || '',
      consumidorFinal: data.consumidorFinal || data.consumidor_final || false,
      tipoContato: data.tipoContato || data.tipo_contato || 'Cliente',
      status: data.status || 'Ativo',
      email: data.email || '',
      fone: data.telefoneFixo || data.telefone_fixo || '',
      celular: data.celular || '',
      pontoReferencia: data.pontoReferencia || data.ponto_referencia || '',
      logradouro: data.endereco || data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      codigoIbge: data.codigoIbge || data.codigo_ibge || '',
      municipio: data.cidade || data.municipio || '',
      uf: data.estado || data.uf || '',
      cep: data.cep || '',
      codigoPais: data.codigoPais || data.codigo_pais || '1058',
      pais: data.pais || 'Brasil',
      logradouroEntrega: data.enderecoEntrega || data.endereco_entrega || data.logradouroEntrega || '',
      numeroEntrega: data.numeroEntrega || data.numero_entrega || '',
      complementoEntrega: data.complementoEntrega || data.complemento_entrega || '',
      bairroEntrega: data.bairroEntrega || data.bairro_entrega || '',
      codigoIbgeEntrega: data.codigoIbgeEntrega || data.codigo_ibge_entrega || '',
      municipioEntrega: data.cidadeEntrega || data.cidade_entrega || data.municipioEntrega || '',
      ufEntrega: data.estadoEntrega || data.estado_entrega || data.ufEntrega || '',
      cepEntrega: data.cepEntrega || data.cep_entrega || '',
      codigoPaisEntrega: data.codigoPaisEntrega || data.codigo_pais_entrega || '1058',
      paisEntrega: data.paisEntrega || data.pais_entrega || 'Brasil',
      limiteCredito: typeof data.limiteCredito === 'number' ? data.limiteCredito :
                     typeof data.limite_credito === 'number' ? data.limite_credito :
                     parseFloat(data.limiteCredito || data.limite_credito || '0') || 0,
      saldoInicial: typeof data.saldoInicial === 'number' ? data.saldoInicial :
                    typeof data.saldo_inicial === 'number' ? data.saldo_inicial :
                    parseFloat(data.saldoInicial || data.saldo_inicial || '0') || 0,
      prazoPagamento: typeof data.prazoPagamento === 'number' ? data.prazoPagamento :
                      typeof data.prazo_pagamento === 'number' ? data.prazo_pagamento :
                      parseInt(data.prazoPagamento || data.prazo_pagamento || '0') || 0,
      dataNascimento: data.dataNascimento || data.data_nascimento || '',
      dataAbertura: data.dataAbertura || data.data_abertura || '',
      camposPersonalizados: data.camposPersonalizados || data.campos_personalizados || [],
    };
  }

  async getAll(): Promise<Cliente[]> {
    return api.get<Cliente[]>(this.basePath);
  }

  async getById(id: number): Promise<Cliente> {
    return api.get<Cliente>(`${this.basePath}/${id}`);
  }

  async create(data: CreateClienteRequest): Promise<Cliente> {
    const transformedData = this.transformToBackend(data);
    return api.post<Cliente>(this.basePath, transformedData);
  }

  async update(id: number, data: UpdateClienteRequest): Promise<Cliente> {
    const transformedData = this.transformToBackend(data);
    return api.put<Cliente>(`${this.basePath}/${id}`, transformedData);
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

