import { Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ChampionsService } from './champions.service';
import { ChampionDocument } from './schemas/champion.schema';

@Controller('champions')
export class ChampionsController {
  constructor(private readonly championsService: ChampionsService) {}

  @Post('fetch/all')
  async fetchChampions() {
    try {
      const results = await this.championsService.fetchAndSaveChampions();
      const generalMessage =
        results.length > 0
          ? 'Champions récupérés et sauvegardés avec succès.'
          : 'Aucun champion à sauvegarder.';

      return { message: generalMessage };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erreur lors de la récupération des champions';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('all/:patch')
  async getChampionsByPatch(@Param('patch') patch: string): Promise<ChampionDocument[]> {
    try {
      const champions = await this.championsService.getChampionsByPatch(patch);
      if (champions.length === 0) {
        throw new HttpException('Aucun champion trouvé pour ce patch', HttpStatus.NOT_FOUND);
      }
      return champions;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Erreur lors de la récupération des champions';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/:patch')
  async getChampionByPatch(
    @Param('id') id: string,
    @Param('patch') patch: string,
  ): Promise<ChampionDocument | null> {
    try {
      const champion = await this.championsService.getChampionByPatch(id, patch);
      if (!champion) {
        throw new HttpException('Champion non trouvé', HttpStatus.NOT_FOUND);
      }
      return champion;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Erreur lors de la récupération du champion';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
