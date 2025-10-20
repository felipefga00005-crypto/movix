import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class UpdateNfeDto {
  @IsOptional()
  @IsString()
  naturezaOperacao?: string;

  @IsOptional()
  @IsNumber()
  tipoOperacao?: number;

  @IsOptional()
  @IsNumber()
  consumidorFinal?: number;

  @IsOptional()
  @IsNumber()
  presencaComprador?: number;

  @IsOptional()
  @IsNumber()
  modalidadeFrete?: number;

  @IsOptional()
  @IsString()
  informacoesAdicionais?: string;

  @IsOptional()
  @IsString()
  informacoesFisco?: string;
}
