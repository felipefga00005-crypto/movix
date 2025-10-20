import { Module } from '@nestjs/common';
import { ExternalApisController } from './external-apis.controller';
import { CnpjLookupService } from './services/cnpj-lookup.service';
import { CepLookupService } from './services/cep-lookup.service';
import { IbgeDataService } from './services/ibge-data.service';
import { ExternalApiService } from './services/external-api.service';

@Module({
  controllers: [ExternalApisController],
  providers: [
    CnpjLookupService,
    CepLookupService,
    IbgeDataService,
    ExternalApiService,
  ],
  exports: [
    CnpjLookupService,
    CepLookupService,
    IbgeDataService,
    ExternalApiService,
  ],
})
export class ExternalApisModule {}
