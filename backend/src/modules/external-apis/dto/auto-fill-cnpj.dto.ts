import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class AutoFillCnpjDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX ou apenas números'
  })
  cnpj: string;
}
