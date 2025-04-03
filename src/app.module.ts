import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LolModule } from './lol/lol.module';

@Module({
  imports: [HttpModule, LolModule],
})
export class AppModule {}
