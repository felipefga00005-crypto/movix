import { IsString, IsNotEmpty } from 'class-validator';

export class ConsultaCepDto {
  @IsString()
  @IsNotEmpty()
  cep: string;
}
