import { IsString, IsOptional, IsInt, IsBoolean, IsEmail, Length, Matches } from 'class-validator';

export class CreateEmitenteDto {
  @IsString()
  @Length(14, 14)
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter apenas números' })
  cnpj: string;

  @IsString()
  @Length(1, 200)
  razaoSocial: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  nomeFantasia?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  inscricaoMunicipal?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  cnae?: string;

  @IsInt()
  regimeTributario: number;

  @IsString()
  @Length(1, 200)
  logradouro: string;

  @IsString()
  @Length(1, 10)
  numero: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  complemento?: string;

  @IsString()
  @Length(1, 100)
  bairro: string;

  @IsString()
  @Length(8, 8)
  @Matches(/^\d{8}$/, { message: 'CEP deve conter apenas números' })
  cep: string;

  @IsString()
  municipioId: string;

  @IsString()
  estadoId: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  telefone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  site?: string;

  @IsOptional()
  @IsString()
  certificadoPath?: string;

  @IsOptional()
  @IsString()
  certificadoPassword?: string;

  @IsOptional()
  @IsInt()
  ambienteNfe?: number;

  @IsOptional()
  @IsInt()
  proximoNumeroNfe?: number;

  @IsOptional()
  @IsInt()
  serieNfe?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
