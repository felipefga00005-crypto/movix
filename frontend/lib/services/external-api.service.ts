const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tipos para as respostas das APIs
export interface CnpjData {
  cnpj: string;
  cnpjFormatado: string;
  razaoSocial: string;
  nomeFantasia?: string;
  situacao: string;
  tipo: 'MATRIZ' | 'FILIAL';
  porte: string;
  naturezaJuridica: string;
  
  // Endereço
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  
  // Contato
  telefone?: string;
  email?: string;
  
  // Inscrições Estaduais
  inscricoesEstaduais?: Array<{
    numero: string;
    uf: string;
    estado: string;
    ativo: boolean;
  }>;
}

export interface CepData {
  cep: string;
  cepFormatado: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado?: string;
  regiao?: string;
}



interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider?: string;
  timestamp?: Date;
}

export class ExternalApiService {
  private static async request<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/external-apis${endpoint}`, {
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }

  static async consultarCnpj(cnpj: string): Promise<CnpjData> {
    const response = await this.request<CnpjData>('/cnpj/consultar', { cnpj });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao consultar CNPJ');
    }
    
    return response.data;
  }

  static async consultarCep(cep: string): Promise<CepData> {
    const response = await this.request<CepData>('/cep/consultar', { cep });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro ao consultar CEP');
    }
    
    return response.data;
  }

  static async autoFillByCnpj(cnpj: string): Promise<CnpjData> {
    const response = await this.request<CnpjData>('/cnpj/consultar', { cnpj });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Erro na consulta do CNPJ');
    }

    return response.data;
  }



  // Utilitários para validação
  static validateCnpj(cnpj: string): boolean {
    const numbers = cnpj.replace(/\D/g, '');
    
    if (numbers.length !== 14) return false;
    if (/^(\d)\1+$/.test(numbers)) return false;

    // Validação dos dígitos verificadores
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const calculateDigit = (cnpj: string, weights: number[]): number => {
      const sum = cnpj
        .slice(0, weights.length)
        .split('')
        .reduce((acc, digit, index) => acc + parseInt(digit) * weights[index], 0);
      
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const digit1 = calculateDigit(numbers, weights1);
    const digit2 = calculateDigit(numbers, weights2);

    return (
      digit1 === parseInt(numbers[12]) &&
      digit2 === parseInt(numbers[13])
    );
  }

  static validateCep(cep: string): boolean {
    const numbers = cep.replace(/\D/g, '');
    return numbers.length === 8 && /^\d{8}$/.test(numbers);
  }

  static formatCnpj(cnpj: string): string {
    const numbers = cnpj.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    }
    return numbers.slice(0, 14).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  static formatCep(cep: string): string {
    const numbers = cep.replace(/\D/g, '');
    return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  static formatCpf(cpf: string): string {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  static validateCpf(cpf: string): boolean {
    const numbers = cpf.replace(/\D/g, '');
    
    if (numbers.length !== 11) return false;
    if (/^(\d)\1+$/.test(numbers)) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;

    return digit1 === parseInt(numbers[9]) && digit2 === parseInt(numbers[10]);
  }
}
