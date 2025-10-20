import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { EmitenteModule } from './modules/emitente/emitente.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { ProdutoModule } from './modules/produto/produto.module';
import { NfeModule } from './modules/nfe/nfe.module';
import { AuxiliaresModule } from './modules/auxiliares/auxiliares.module';
import { ExternalApisModule } from './modules/external-apis/external-apis.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    CommonModule,
    EmitenteModule,
    ClienteModule,
    ProdutoModule,
    NfeModule,
    AuxiliaresModule,
    ExternalApisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
