import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ExternalApiService } from './services/external-api.service';
import { CnpjLookupService } from './services/cnpj-lookup.service';
import { CepLookupService } from './services/cep-lookup.service';
import { IbgeDataService } from './services/ibge-data.service';
import { ConsultaCnpjDto } from './dto/consulta-cnpj.dto';
import { ConsultaCepDto } from './dto/consulta-cep.dto';
import { AutoFillCnpjDto } from './dto/auto-fill-cnpj.dto';
import { AutoFillCepDto } from './dto/auto-fill-cep.dto';
import { ValidacaoCruzadaDto } from './dto/validacao-cruzada.dto';

@Controller('external-apis')
export class ExternalApisController {
  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly cnpjService: CnpjLookupService,
    private readonly cepService: CepLookupService,
    private readonly ibgeService: IbgeDataService,
  ) {}

  /**
   * Consulta dados de CNPJ
   */
  @Post('cnpj/consultar')
  async consultarCnpj(@Body() dto: ConsultaCnpjDto) {
    const result = await this.cnpjService.consultarCnpj(dto.cnpj);
    
    if (!result.success) {
      throw new HttpException(result.error || 'Erro desconhecido', HttpStatus.BAD_REQUEST);
    }
    
    return {
      success: true,
      data: result.data,
      provider: result.provider,
      timestamp: result.timestamp,
    };
  }

  /**
   * Consulta dados de CEP
   */
  @Post('cep/consultar')
  async consultarCep(@Body() dto: ConsultaCepDto) {
    const result = await this.cepService.consultarCep(dto.cep);
    
    if (!result.success) {
      throw new HttpException(result.error || 'Erro desconhecido', HttpStatus.BAD_REQUEST);
    }
    
    return {
      success: true,
      data: result.data,
      provider: result.provider,
      timestamp: result.timestamp,
    };
  }

  /**
   * Auto-preenchimento baseado em CNPJ
   */
  @Post('auto-fill/cnpj')
  async autoFillByCnpj(@Body() dto: AutoFillCnpjDto) {
    const result = await this.externalApiService.autoFillByCnpj(dto.cnpj);
    
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    
    return {
      success: true,
      data: result.data,
      timestamp: result.timestamp,
    };
  }

  /**
   * Auto-preenchimento baseado em CEP
   */
  @Post('auto-fill/cep')
  async autoFillByCep(@Body() dto: AutoFillCepDto) {
    const result = await this.externalApiService.autoFillByCep(dto.cep);
    
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return {
      success: true,
      data: result.data,
      timestamp: result.timestamp,
    };
  }

  /**
   * Validação cruzada de dados
   */
  @Post('validacao-cruzada')
  async validacaoCruzada(@Body() dto: ValidacaoCruzadaDto) {
    const result = await this.externalApiService.validateCrossData(dto);

    return {
      success: result.valid,
      data: {
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Busca CEPs por endereço
   */
  @Get('cep/buscar')
  async buscarCepsPorEndereco(
    @Query('uf') uf: string,
    @Query('cidade') cidade: string,
    @Query('logradouro') logradouro?: string,
  ) {
    const result = await this.cepService.buscarCepsPorEndereco(uf, cidade, logradouro);

    if (!result.success) {
      throw new HttpException(result.error || 'Erro desconhecido', HttpStatus.BAD_REQUEST);
    }
    
    return {
      success: true,
      data: result.data,
      provider: result.provider,
      timestamp: result.timestamp,
    };
  }

  /**
   * Lista todos os estados
   */
  @Get('ibge/estados')
  async getEstados() {
    const result = await this.ibgeService.getEstados();
    
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return {
      success: true,
      data: result.data,
      provider: result.provider,
      timestamp: result.timestamp,
    };
  }

  /**
   * Busca estado por ID ou sigla
   */
  @Get('ibge/estados/:identificador')
  async getEstado(@Param('identificador') identificador: string) {
    const result = await this.ibgeService.getEstado(identificador);
    
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    
    return {
      success: true,
      data: result.data,
      provider: result.provider,
      timestamp: result.timestamp,
    };
  }

  /**
   * Lista municípios por estado
   */
  @Get('ibge/municipios/:uf')
  async getMunicipiosByEstado(@Param('uf') uf: string) {
    const result = await this.ibgeService.getMunicipiosByEstado(uf);
    
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    
    return {
      success: true,
      data: result.data,
      provider: result.provider,
      timestamp: result.timestamp,
    };
  }

  /**
   * Busca municípios por nome
   */
  @Get('ibge/municipios/buscar/:nome')
  async buscarMunicipiosPorNome(
    @Param('nome') nome: string,
    @Query('uf') uf?: string,
  ) {
    const result = await this.ibgeService.buscarMunicipiosPorNome(nome, uf);
    
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    
    return {
      success: true,
      data: result.data,
      provider: result.provider,
      timestamp: result.timestamp,
    };
  }

  /**
   * Busca sugestões de endereço
   */
  @Get('sugestoes/endereco')
  async getSugestoesEndereco(
    @Query('uf') uf: string,
    @Query('municipio') municipio: string,
    @Query('logradouro') logradouro?: string,
  ) {
    const result = await this.externalApiService.getSugestoesEndereco({
      uf,
      municipio,
      logradouro,
    });
    
    if (!result.success) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    
    return {
      success: true,
      data: result.data,
      timestamp: result.timestamp,
    };
  }

  /**
   * Health check das APIs externas
   */
  @Get('health')
  async healthCheck() {
    const health = await this.externalApiService.healthCheck();
    
    return {
      success: health.overall,
      data: health,
      timestamp: new Date(),
    };
  }

  /**
   * Estatísticas das APIs
   */
  @Get('stats')
  async getStats() {
    const stats = this.externalApiService.getApiStats();
    
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }
}
