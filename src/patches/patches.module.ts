import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatchesController } from './patches.controller';
import { PatchesService } from './patches.service';
import { Patch, PatchSchema } from './schemas/patch.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Patch.name, schema: PatchSchema }]), HttpModule],
  controllers: [PatchesController],
  providers: [PatchesService],
  exports: [PatchesService],
})
export class PatchesModule {}
