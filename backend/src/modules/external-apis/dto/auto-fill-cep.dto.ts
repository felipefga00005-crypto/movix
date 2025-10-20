import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class AutoFillCepDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'CEP deve estar no formato XXXXX-XXX ou apenas números'
  })
  cep: string;
}
