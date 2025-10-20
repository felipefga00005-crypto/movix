import { Module } from '@nestjs/common';
import { AuxiliaresController } from './auxiliares.controller';

@Module({
  controllers: [AuxiliaresController],
})
export class AuxiliaresModule {}
