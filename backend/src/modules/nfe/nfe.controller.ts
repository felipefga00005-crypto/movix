import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { NfeService } from './nfe.service';
import { NfeIntegrationService } from './nfe-integration.service';
import { CreateNfeDto } from './dto/create-nfe.dto';
import { UpdateNfeDto } from './dto/update-nfe.dto';

@Controller('nfes')
export class NfeController {
  constructor(
    private readonly nfeService: NfeService,
    private readonly nfeIntegrationService: NfeIntegrationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createNfeDto: CreateNfeDto) {
    return this.nfeService.create(createNfeDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('emitenteId') emitenteId?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.nfeService.findAll(pageNum, limitNum, emitenteId, status);
  }

  @Get('health')
  checkHealth() {
    return this.nfeIntegrationService.checkHealth();
  }

  @Get('sefaz-status')
  checkSefazStatus() {
    return this.nfeIntegrationService.checkSefazStatus();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nfeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateNfeDto: UpdateNfeDto) {
    return this.nfeService.update(id, updateNfeDto);
  }

  @Post(':id/transmitir')
  transmitir(@Param('id') id: string) {
    return this.nfeService.transmitir(id);
  }

  @Post(':id/consultar')
  async consultar(@Param('id') id: string) {
    const nfe = await this.nfeService.findOne(id);
    if (!nfe.chave) {
      throw new Error('NFe não possui chave de acesso');
    }
    return this.nfeIntegrationService.consultarNfe(nfe.chave);
  }

  @Post(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Body() body: { justificativa: string },
  ) {
    const nfe = await this.nfeService.findOne(id);
    if (!nfe.chave) {
      throw new Error('NFe não possui chave de acesso');
    }
    return this.nfeIntegrationService.cancelarNfe(nfe.chave, body.justificativa);
  }

  @Post(':id/carta-correcao')
  async cartaCorrecao(
    @Param('id') id: string,
    @Body() body: { correcao: string; sequencia?: number },
  ) {
    const nfe = await this.nfeService.findOne(id);
    if (!nfe.chave) {
      throw new Error('NFe não possui chave de acesso');
    }
    return this.nfeIntegrationService.cartaCorrecao(
      nfe.chave,
      body.correcao,
      body.sequencia || 1,
    );
  }

  @Get(':id/xml')
  async downloadXml(
    @Param('id') id: string,
    @Query('type') type: 'generated' | 'signed' | 'authorized' = 'authorized',
    @Res() res: Response,
  ) {
    const nfe = await this.nfeService.findOne(id);
    if (!nfe.chave) {
      throw new NotFoundException('NFe não possui chave de acesso');
    }

    const xml = await this.nfeService.getXmlFile(nfe.chave, type);
    if (!xml) {
      throw new NotFoundException(`XML ${type} não encontrado`);
    }

    res.set({
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename="${nfe.chave}.xml"`,
    });

    return res.send(xml);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const nfe = await this.nfeService.findOne(id);
    if (!nfe.chave) {
      throw new NotFoundException('NFe não possui chave de acesso');
    }

    const pdf = await this.nfeService.getPdfFile(nfe.chave);
    if (!pdf) {
      throw new NotFoundException('PDF não encontrado');
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="NFe_${nfe.chave}.pdf"`,
    });

    return res.send(pdf);
  }

  @Get(':id/files/info')
  async getFileInfo(@Param('id') id: string) {
    const nfe = await this.nfeService.findOne(id);
    if (!nfe.chave) {
      throw new NotFoundException('NFe não possui chave de acesso');
    }

    return this.nfeService.getFileInfo(nfe.chave);
  }
}
