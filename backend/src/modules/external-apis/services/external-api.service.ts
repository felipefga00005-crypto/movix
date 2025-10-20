import { Injectable, Logger } from '@nestjs/common';
import { CnpjLookupService } from './cnpj-lookup.service';
import { CepLookupService } from './cep-lookup.service';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  constructor(
    private readonly cnpjService: CnpjLookupService,
    private readonly cepService: CepLookupService,
  ) {}

}
