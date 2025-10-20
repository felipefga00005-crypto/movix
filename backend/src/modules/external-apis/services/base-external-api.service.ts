import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';

export interface ApiProvider {
  name: string;
  url: string;
  priority: number;
  timeout?: number;
  retries?: number;
  rateLimit?: string;
  features?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  provider?: string;
  cached?: boolean;
  timestamp?: Date;
}

export abstract class BaseExternalApiService {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      timeout: 10000, // 10 segundos default
      headers: {
        'User-Agent': 'Movix-System/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para logs
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`Making request to: ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error(`Request error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`Response received from: ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error(`Response error: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Executa uma consulta com fallback automático entre provedores
   */
  protected async executeWithFallback<T>(
    providers: ApiProvider[],
    requestFn: (provider: ApiProvider) => Promise<T>,
    cacheKey?: string
  ): Promise<ApiResponse<T>> {
    // Ordena provedores por prioridade
    const sortedProviders = providers.sort((a, b) => a.priority - b.priority);

    for (const provider of sortedProviders) {
      try {
        this.logger.log(`Trying provider: ${provider.name}`);
        
        const startTime = Date.now();
        const data = await this.executeWithRetry(
          () => requestFn(provider),
          provider.retries || 2
        );
        const duration = Date.now() - startTime;

        this.logger.log(`Success with ${provider.name} in ${duration}ms`);

        return {
          success: true,
          data,
          provider: provider.name,
          timestamp: new Date(),
        };
      } catch (error) {
        this.logger.warn(`Provider ${provider.name} failed: ${error.message}`);
        
        // Se é o último provedor, retorna erro
        if (provider === sortedProviders[sortedProviders.length - 1]) {
          return {
            success: false,
            error: `All providers failed. Last error: ${error.message}`,
            timestamp: new Date(),
          };
        }
        
        // Continua para o próximo provedor
        continue;
      }
    }

    return {
      success: false,
      error: 'No providers available',
      timestamp: new Date(),
    };
  }

  /**
   * Executa uma função com retry automático
   */
  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt <= maxRetries) {
          this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await this.sleep(delay);
          delay *= 2; // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  /**
   * Faz uma requisição HTTP com configurações específicas
   */
  protected async makeRequest<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.httpClient.get(url, config);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Erro de resposta HTTP
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // Erro de rede
        throw new Error('Network error: No response received');
      } else {
        // Erro de configuração
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  /**
   * Valida se uma string é um CNPJ válido
   */
  protected validateCnpj(cnpj: string): boolean {
    const cleanCnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cleanCnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleanCnpj)) return false; // Todos os dígitos iguais

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

    const digit1 = calculateDigit(cleanCnpj, weights1);
    const digit2 = calculateDigit(cleanCnpj, weights2);

    return (
      digit1 === parseInt(cleanCnpj[12]) &&
      digit2 === parseInt(cleanCnpj[13])
    );
  }

  /**
   * Valida se uma string é um CEP válido
   */
  protected validateCep(cep: string): boolean {
    const cleanCep = cep.replace(/[^\d]/g, '');
    return cleanCep.length === 8 && /^\d{8}$/.test(cleanCep);
  }

  /**
   * Formata CNPJ para exibição
   */
  protected formatCnpj(cnpj: string): string {
    const clean = cnpj.replace(/[^\d]/g, '');
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata CEP para exibição
   */
  protected formatCep(cep: string): string {
    const clean = cep.replace(/[^\d]/g, '');
    return clean.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  /**
   * Remove formatação de CNPJ/CEP
   */
  protected cleanDocument(document: string): string {
    return document.replace(/[^\d]/g, '');
  }

  /**
   * Utilitário para sleep
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica se uma resposta está vazia ou inválida
   */
  protected isValidResponse(data: any): boolean {
    return data && typeof data === 'object' && Object.keys(data).length > 0;
  }
}
