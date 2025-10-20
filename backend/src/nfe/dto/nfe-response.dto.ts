export class NfeResponseDto {
  chave: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  protocolo?: string;
  status: string;
  mensagem?: string;
  xml?: string;
  pdf?: string;
}

export class NfeStatusDto {
  chave: string;
  status: string;
  protocolo?: string;
  dataAutorizacao?: string;
  mensagem?: string;
}

export class NfeCancelamentoDto {
  chave: string;
  protocolo: string;
  justificativa: string;
}

export class NfeInutilizacaoDto {
  cnpj: string;
  serie: string;
  numeroInicial: number;
  numeroFinal: number;
  ano: number;
  justificativa: string;
}

