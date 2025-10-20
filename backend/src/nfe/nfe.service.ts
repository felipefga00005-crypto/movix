import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateNfeDto } from './dto/create-nfe.dto';
import { NfeResponseDto, NfeStatusDto, NfeCancelamentoDto, NfeInutilizacaoDto } from './dto/nfe-response.dto';

@Injectable()
export class NfeService {
  private readonly phpServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    // URL do microserviço PHP (pode ser configurado via env)
    this.phpServiceUrl = process.env.PHP_NFE_SERVICE_URL || 'http://localhost:8080';
  }

  /**
   * Emitir uma nova NFe
   */
  async emitirNfe(createNfeDto: CreateNfeDto): Promise<NfeResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.phpServiceUrl}/api/nfe/emitir`, createNfeDto)
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Erro ao emitir NFe',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Consultar status de uma NFe
   */
  async consultarNfe(chave: string): Promise<NfeStatusDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.phpServiceUrl}/api/nfe/consultar/${chave}`)
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Erro ao consultar NFe',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cancelar uma NFe
   */
  async cancelarNfe(cancelamentoDto: NfeCancelamentoDto): Promise<NfeResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.phpServiceUrl}/api/nfe/cancelar`, cancelamentoDto)
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Erro ao cancelar NFe',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Inutilizar numeração de NFe
   */
  async inutilizarNumeracao(inutilizacaoDto: NfeInutilizacaoDto): Promise<NfeResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.phpServiceUrl}/api/nfe/inutilizar`, inutilizacaoDto)
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Erro ao inutilizar numeração',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Baixar XML da NFe
   */
  async baixarXml(chave: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.phpServiceUrl}/api/nfe/xml/${chave}`)
      );
      return response.data.xml;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Erro ao baixar XML',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Baixar PDF (DANFE) da NFe
   */
  async baixarPdf(chave: string): Promise<Buffer> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.phpServiceUrl}/api/nfe/pdf/${chave}`, {
          responseType: 'arraybuffer',
        })
      );
      return Buffer.from(response.data);
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Erro ao baixar PDF',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Listar NFes emitidas
   */
  async listarNfes(filtros?: {
    dataInicio?: string;
    dataFim?: string;
    status?: string;
  }): Promise<NfeResponseDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.phpServiceUrl}/api/nfe/listar`, {
          params: filtros,
        })
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Erro ao listar NFes',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

