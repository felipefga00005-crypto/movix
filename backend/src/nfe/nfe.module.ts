import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NfeController } from './nfe.controller';
import { NfeService } from './nfe.service';

@Module({
  imports: [HttpModule],
  controllers: [NfeController],
  providers: [NfeService],
  exports: [NfeService],
})
export class NfeModule {}

