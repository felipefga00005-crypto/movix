import { Module } from '@nestjs/common';
import { ExternalApisController } from './external-apis.controller';
import { CnpjLookupService } from './services/cnpj-lookup.service';
import { CepLookupService } from './services/cep-lookup.service';
import { IbgeDataService } from './services/ibge-data.service';
import { IbgeCacheService } from './services/ibge-cache.service';
import { ExternalApiService } from './services/external-api.service';
import { AuxiliaresModule } from '../auxiliares/auxiliares.module';

@Module({
  imports: [AuxiliaresModule],
  controllers: [ExternalApisController],
  providers: [
    CnpjLookupService,
    CepLookupService,
    IbgeDataService,
    IbgeCacheService,
    ExternalApiService,
  ],
  exports: [
    CnpjLookupService,
    CepLookupService,
    IbgeDataService,
    IbgeCacheService,
    ExternalApiService,
  ],
})
export class ExternalApisModule {}
