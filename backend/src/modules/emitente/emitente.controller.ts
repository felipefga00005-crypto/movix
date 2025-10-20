import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmitenteService } from './emitente.service';
import { CreateEmitenteDto } from './dto/create-emitente.dto';
import { UpdateEmitenteDto } from './dto/update-emitente.dto';

@Controller('emitentes')
export class EmitenteController {
  constructor(private readonly emitenteService: EmitenteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createEmitenteDto: CreateEmitenteDto) {
    return this.emitenteService.create(createEmitenteDto);
  }

  @Get()
  findAll() {
    return this.emitenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emitenteService.findOne(id);
  }

  @Get('cnpj/:cnpj')
  findByCnpj(@Param('cnpj') cnpj: string) {
    return this.emitenteService.findByCnpj(cnpj);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEmitenteDto: UpdateEmitenteDto,
  ) {
    return this.emitenteService.update(id, updateEmitenteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.emitenteService.remove(id);
  }

  @Get(':id/proximo-numero-nfe')
  getProximoNumeroNfe(@Param('id') id: string) {
    return this.emitenteService.getProximoNumeroNfe(id);
  }
}
