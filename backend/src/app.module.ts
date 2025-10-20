import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NfeModule } from './nfe/nfe.module';

@Module({
  imports: [NfeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
