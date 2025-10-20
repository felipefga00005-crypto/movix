import { IsString, IsOptional, IsInt, IsBoolean, IsEmail, Length, Matches, IsIn } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsIn(['FISICA', 'JURIDICA'])
  tipo: string;

  @IsString()
  @Length(11, 14)
  @Matches(/^\d{11,14}$/, { message: 'Documento deve conter apenas números' })
  documento: string; // CPF ou CNPJ

  @IsString()
  @Length(1, 200)
  nome: string; // Nome ou Razão Social

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

  // Endereço
  @IsString()
  @Length(1, 200)
  logradouro: string;

  @IsString()
  @Length(1, 20)
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

  // Contato
  @IsOptional()
  @IsString()
  @Length(1, 20)
  telefone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  celular?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // Configurações
  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 9])
  indicadorIE?: number; // 1=Contribuinte, 2=Isento, 9=Não contribuinte

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
