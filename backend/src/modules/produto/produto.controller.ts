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
} from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Controller('produtos')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createProdutoDto: CreateProdutoDto) {
    return this.produtoService.create(createProdutoDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.produtoService.findAll(pageNum, limitNum, search);
  }

  @Get('select')
  getProdutosForSelect() {
    return this.produtoService.getProdutosForSelect();
  }

  @Get('estoque-baixo')
  getProdutosComEstoqueBaixo() {
    return this.produtoService.getProdutosComEstoqueBaixo();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtoService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.produtoService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProdutoDto: UpdateProdutoDto,
  ) {
    return this.produtoService.update(id, updateProdutoDto);
  }

  @Patch(':id/estoque')
  updateEstoque(
    @Param('id') id: string,
    @Body() body: { quantidade: number; operacao: 'ENTRADA' | 'SAIDA' },
  ) {
    return this.produtoService.updateEstoque(id, body.quantidade, body.operacao);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.produtoService.remove(id);
  }
}
