import { Controller, Get, Post } from '@nestjs/common';
import { PatchesService } from './patches.service';

@Controller('patches')
export class PatchesController {
  constructor(private readonly patchesService: PatchesService) {}

  @Post('fetch/all')
  async fetchPatches() {
    const result = await this.patchesService.fetchAndSavePatches();
    if (result.length === 0) {
      return { message: 'Aucune nouvelle version disponible' };
    }
    return result;
  }

  @Get('all')
  async getAllPatches() {
    return await this.patchesService.getAllPatches();
  }

  @Get('latest')
  async getLatestPatch() {
    return await this.patchesService.getLatestPatch();
  }
}
