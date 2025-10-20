import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { NfeService } from './nfe.service';
import { CreateNfeDto } from './dto/create-nfe.dto';
import { NfeCancelamentoDto, NfeInutilizacaoDto } from './dto/nfe-response.dto';

@Controller('nfe')
export class NfeController {
  constructor(private readonly nfeService: NfeService) {}

  @Post('emitir')
  async emitirNfe(@Body() createNfeDto: CreateNfeDto) {
    return this.nfeService.emitirNfe(createNfeDto);
  }

  @Get('consultar/:chave')
  async consultarNfe(@Param('chave') chave: string) {
    return this.nfeService.consultarNfe(chave);
  }

  @Post('cancelar')
  async cancelarNfe(@Body() cancelamentoDto: NfeCancelamentoDto) {
    return this.nfeService.cancelarNfe(cancelamentoDto);
  }

  @Post('inutilizar')
  async inutilizarNumeracao(@Body() inutilizacaoDto: NfeInutilizacaoDto) {
    return this.nfeService.inutilizarNumeracao(inutilizacaoDto);
  }

  @Get('xml/:chave')
  async baixarXml(@Param('chave') chave: string, @Res() res: Response) {
    const xml = await this.nfeService.baixarXml(chave);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="NFe-${chave}.xml"`);
    return res.send(xml);
  }

  @Get('pdf/:chave')
  async baixarPdf(@Param('chave') chave: string, @Res() res: Response) {
    const pdf = await this.nfeService.baixarPdf(chave);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="DANFE-${chave}.pdf"`);
    return res.send(pdf);
  }

  @Get('listar')
  async listarNfes(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('status') status?: string,
  ) {
    return this.nfeService.listarNfes({ dataInicio, dataFim, status });
  }
}

