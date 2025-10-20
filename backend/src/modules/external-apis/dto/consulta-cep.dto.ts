import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ConsultaCepDto {
  @IsString()
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'CEP deve estar no formato XXXXX-XXX ou apenas números',
  })
  cep: string;
}
