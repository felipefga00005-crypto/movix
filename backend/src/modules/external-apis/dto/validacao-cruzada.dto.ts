import { IsString, IsOptional, Matches } from 'class-validator';

export class ValidacaoCruzadaDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX ou apenas números',
  })
  cnpj?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'CEP deve estar no formato XXXXX-XXX ou apenas números',
  })
  cep?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'UF deve ter exatamente 2 letras maiúsculas',
  })
  uf?: string;

  @IsOptional()
  @IsString()
  municipio?: string;
}
