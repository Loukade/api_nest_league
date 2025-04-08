import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatchesModule } from '../patches/patches.module';
import { ChampionsController } from './champions.controller';
import { ChampionsService } from './champions.service';
import { Champion, ChampionSchema } from './schemas/champion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Champion.name, schema: ChampionSchema }]),
    HttpModule,
    PatchesModule,
  ],
  controllers: [ChampionsController],
  providers: [ChampionsService],
  exports: [ChampionsService],
})
export class ChampionsModule {}
