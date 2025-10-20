import { Injectable, Logger } from '@nestjs/common';
import { CnpjLookupService, CnpjData } from './cnpj-lookup.service';
import { CepLookupService, CepData } from './cep-lookup.service';
import { IbgeDataService, Estado, Municipio } from './ibge-data.service';
import { ApiResponse } from './base-external-api.service';

export interface AutoFillData {
  cnpj?: CnpjData;
  cep?: CepData;
  estado?: Estado;
  municipio?: Municipio;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  constructor(
    private readonly cnpjService: CnpjLookupService,
    private readonly cepService: CepLookupService,
    private readonly ibgeService: IbgeDataService,
  ) {}

  /**
   * Auto-preenchimento completo baseado em CNPJ
   */
  async autoFillByCnpj(cnpj: string): Promise<ApiResponse<AutoFillData>> {
    try {
      this.logger.log(`Iniciando auto-preenchimento para CNPJ: ${cnpj}`);
      
      const cnpjResult = await this.cnpjService.consultarCnpj(cnpj);
      
      if (!cnpjResult.success) {
        return {
          success: false,
          error: cnpjResult.error,
          timestamp: new Date(),
        };
      }

      const autoFillData: AutoFillData = {
        cnpj: cnpjResult.data,
      };

      // Se tem CEP, busca dados do endereço
      if (cnpjResult.data?.cep) {
        this.logger.log(`Buscando dados do CEP: ${cnpjResult.data.cep}`);
        
        const cepResult = await this.cepService.consultarCep(cnpjResult.data.cep);
        if (cepResult.success) {
          autoFillData.cep = cepResult.data;
          
          // Busca dados do estado se disponível
          if (cepResult.data?.uf) {
            const estadoResult = await this.ibgeService.getEstado(cepResult.data.uf);
            if (estadoResult.success) {
              autoFillData.estado = estadoResult.data;
            }
          }
        }
      }

      this.logger.log(`Auto-preenchimento concluído com sucesso para CNPJ: ${cnpj}`);
      
      return {
        success: true,
        data: autoFillData,
        provider: 'ExternalApiService',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Erro no auto-preenchimento por CNPJ: ${error.message}`);
      
      return {
        success: false,
        error: `Erro no auto-preenchimento: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Auto-preenchimento baseado em CEP
   */
  async autoFillByCep(cep: string): Promise<ApiResponse<AutoFillData>> {
    try {
      this.logger.log(`Iniciando auto-preenchimento para CEP: ${cep}`);
      
      const cepResult = await this.cepService.consultarCep(cep);
      
      if (!cepResult.success) {
        return {
          success: false,
          error: cepResult.error,
          timestamp: new Date(),
        };
      }

      const autoFillData: AutoFillData = {
        cep: cepResult.data,
      };

      // Busca dados do estado
      if (cepResult.data?.uf) {
        const estadoResult = await this.ibgeService.getEstado(cepResult.data.uf);
        if (estadoResult.success) {
          autoFillData.estado = estadoResult.data;
        }
      }

      this.logger.log(`Auto-preenchimento concluído com sucesso para CEP: ${cep}`);
      
      return {
        success: true,
        data: autoFillData,
        provider: 'ExternalApiService',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Erro no auto-preenchimento por CEP: ${error.message}`);
      
      return {
        success: false,
        error: `Erro no auto-preenchimento: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validação cruzada de dados
   */
  async validateCrossData(data: {
    cnpj?: string;
    cep?: string;
    uf?: string;
    municipio?: string;
  }): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Valida CNPJ se fornecido
      if (data.cnpj) {
        const cnpjResult = await this.cnpjService.consultarCnpj(data.cnpj);
        if (!cnpjResult.success) {
          errors.push(`CNPJ inválido: ${cnpjResult.error}`);
        } else {
          // Valida consistência entre CNPJ e CEP
          if (data.cep && cnpjResult.data?.cep) {
            const cnpjCep = cnpjResult.data.cep.replace(/[^\d]/g, '');
            const inputCep = data.cep.replace(/[^\d]/g, '');
            
            if (cnpjCep !== inputCep) {
              warnings.push('CEP informado difere do CEP cadastrado no CNPJ');
            }
          }

          // Valida consistência entre CNPJ e UF
          if (data.uf && cnpjResult.data?.uf) {
            if (cnpjResult.data.uf.toUpperCase() !== data.uf.toUpperCase()) {
              warnings.push('UF informada difere da UF cadastrada no CNPJ');
            }
          }
        }
      }

      // Valida CEP se fornecido
      if (data.cep) {
        const cepResult = await this.cepService.consultarCep(data.cep);
        if (!cepResult.success) {
          errors.push(`CEP inválido: ${cepResult.error}`);
        } else {
          // Valida consistência entre CEP e UF
          if (data.uf && cepResult.data?.uf) {
            if (cepResult.data.uf.toUpperCase() !== data.uf.toUpperCase()) {
              errors.push('UF informada não corresponde ao CEP');
            }
          }

          // Valida consistência entre CEP e município
          if (data.municipio && cepResult.data?.localidade) {
            const cepMunicipio = this.normalizarTexto(cepResult.data.localidade);
            const inputMunicipio = this.normalizarTexto(data.municipio);
            
            if (!cepMunicipio.includes(inputMunicipio) && !inputMunicipio.includes(cepMunicipio)) {
              warnings.push('Município informado pode não corresponder ao CEP');
            }
          }
        }
      }

      // Valida UF se fornecida
      if (data.uf) {
        const estadoResult = await this.ibgeService.getEstado(data.uf);
        if (!estadoResult.success) {
          errors.push('UF inválida');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error(`Erro na validação cruzada: ${error.message}`);
      
      return {
        valid: false,
        errors: [`Erro na validação: ${error.message}`],
        warnings,
      };
    }
  }

  /**
   * Busca sugestões de endereço baseado em dados parciais
   */
  async getSugestoesEndereco(dados: {
    uf?: string;
    municipio?: string;
    logradouro?: string;
  }): Promise<ApiResponse<CepData[]>> {
    if (!dados.uf || !dados.municipio) {
      return {
        success: false,
        error: 'UF e município são obrigatórios para busca de sugestões',
        timestamp: new Date(),
      };
    }

    try {
      return await this.cepService.buscarCepsPorEndereco(
        dados.uf,
        dados.municipio,
        dados.logradouro
      );
    } catch (error) {
      return {
        success: false,
        error: `Erro na busca de sugestões: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Busca municípios por nome com filtro de UF
   */
  async buscarMunicipios(nome: string, uf?: string): Promise<ApiResponse<Municipio[]>> {
    try {
      return await this.ibgeService.buscarMunicipiosPorNome(nome, uf);
    } catch (error) {
      return {
        success: false,
        error: `Erro na busca de municípios: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Obtém estatísticas de uso das APIs
   */
  getApiStats(): {
    providers: string[];
    features: string[];
    lastUpdate: Date;
  } {
    return {
      providers: ['CNPJ.ws', 'BrasilAPI', 'ReceitaWS', 'ViaCEP', 'PostMon', 'IBGE'],
      features: [
        'inscricao_estadual',
        'auto_preenchimento',
        'validacao_cruzada',
        'fallback_automatico',
        'cache_inteligente',
        'busca_reversa_cep',
        'coordenadas_geograficas',
      ],
      lastUpdate: new Date(),
    };
  }

  /**
   * Verifica saúde das APIs externas
   */
  async healthCheck(): Promise<{
    cnpj: boolean;
    cep: boolean;
    ibge: boolean;
    overall: boolean;
  }> {
    const results = {
      cnpj: false,
      cep: false,
      ibge: false,
      overall: false,
    };

    try {
      // Testa CNPJ com um CNPJ conhecido
      const cnpjTest = await this.cnpjService.consultarCnpj('11222333000181');
      results.cnpj = cnpjTest.success;

      // Testa CEP com um CEP conhecido
      const cepTest = await this.cepService.consultarCep('01310-100');
      results.cep = cepTest.success;

      // Testa IBGE
      const ibgeTest = await this.ibgeService.getEstados();
      results.ibge = ibgeTest.success;

      results.overall = results.cnpj && results.cep && results.ibge;
    } catch (error) {
      this.logger.error(`Erro no health check: ${error.message}`);
    }

    return results;
  }

  /**
   * Normaliza texto para comparação
   */
  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .trim();
  }
}
