import { IsString, IsNotEmpty } from 'class-validator';

export class ConsultaCnpjDto {
  @IsString()
  @IsNotEmpty()
  cnpj: string;
}
