const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Emitente {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  cnae?: string;
  regimeTributario: number;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  municipioId: string;
  estadoId: string;
  telefone?: string;
  email?: string;
  site?: string;
  certificadoPath?: string;
  certificadoPassword?: string;
  ambienteNfe?: number;
  proximoNumeroNfe?: number;
  serieNfe?: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  municipio?: {
    id: string;
    nome: string;
    estado: {
      id: string;
      nome: string;
      uf: string;
    };
  };
  estado?: {
    id: string;
    nome: string;
    uf: string;
  };
}

export interface CreateEmitenteData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  cnae?: string;
  regimeTributario: number;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  municipioId: string;
  estadoId: string;
  telefone?: string;
  email?: string;
  site?: string;
  certificadoPath?: string;
  certificadoPassword?: string;
  ambienteNfe?: number;
  proximoNumeroNfe?: number;
  serieNfe?: number;
  ativo?: boolean;
}

export class EmitenteService {
  static async getAll(): Promise<Emitente[]> {
    const response = await fetch(`${API_BASE_URL}/emitentes`);
    if (!response.ok) {
      throw new Error('Erro ao buscar emitentes');
    }
    const data = await response.json();
    return data.data || data;
  }

  static async getById(id: string): Promise<Emitente> {
    const response = await fetch(`${API_BASE_URL}/emitentes/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar emitente');
    }
    return response.json();
  }

  static async getByCnpj(cnpj: string): Promise<Emitente> {
    const response = await fetch(`${API_BASE_URL}/emitentes/cnpj/${cnpj}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar emitente por CNPJ');
    }
    return response.json();
  }

  static async create(data: CreateEmitenteData): Promise<Emitente> {
    const response = await fetch(`${API_BASE_URL}/emitentes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar emitente');
    }

    return response.json();
  }

  static async update(id: string, data: Partial<CreateEmitenteData>): Promise<Emitente> {
    const response = await fetch(`${API_BASE_URL}/emitentes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar emitente');
    }

    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/emitentes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir emitente');
    }
  }

  static async getProximoNumeroNfe(id: string): Promise<{ proximoNumero: number }> {
    const response = await fetch(`${API_BASE_URL}/emitentes/${id}/proximo-numero-nfe`);
    if (!response.ok) {
      throw new Error('Erro ao buscar próximo número de NFe');
    }
    return response.json();
  }
}
