import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { PatchesService } from '../patches/patches.service';
import { Champion, ChampionDocument } from './schemas/champion.schema';

interface ChampionData {
  id: string;
  name: string;
  title: string;
  blurb: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  tags: string[];
  partype?: string;
  stats: {
    hp: number;
    hpperlevel: number;
    mp: number;
    mpperlevel: number;
    movespeed: number;
    armor: number;
    armorperlevel: number;
    spellblock: number;
    spellblockperlevel: number;
    attackrange: number;
    hpregen: number;
    hpregenperlevel: number;
    mpregen: number;
    mpregenperlevel: number;
    crit: number;
    critperlevel: number;
    attackdamage: number;
    attackdamageperlevel: number;
    attackspeedperlevel: number;
    attackspeed: number;
  };
}

interface ChampionResponse {
  data: {
    [key: string]: ChampionData;
  };
}

@Injectable()
export class ChampionsService {
  constructor(
    @InjectModel(Champion.name) private readonly championModel: Model<ChampionDocument>,
    private readonly httpService: HttpService,
    private readonly patchesService: PatchesService,
  ) {}

  async fetchAndSaveChampions() {
    const latestPatch = await this.patchesService.getLatestPatch();
    if (!latestPatch) {
      throw new Error('Aucun patch trouvé');
    }

    const url = `https://ddragon.leagueoflegends.com/cdn/${latestPatch.version}/data/fr_FR/champion.json`;
    const response = await firstValueFrom(this.httpService.get<ChampionResponse>(url));
    const champions = response.data.data;

    for (const key of Object.keys(champions)) {
      const championUrl = `https://ddragon.leagueoflegends.com/cdn/${latestPatch.version}/data/fr_FR/champion/${key}.json`;
      const championResponse = await firstValueFrom(
        this.httpService.get<ChampionResponse>(championUrl),
      );
      const championData = championResponse.data.data[key];

      // Vérifier si le champion existe déjà pour ce patch
      const existingChampion = await this.championModel.findOne({
        id: championData.id,
        patch: latestPatch.version,
      });

      if (!existingChampion) {
        const champion = new this.championModel({
          id: championData.id,
          name: championData.name,
          title: championData.title,
          blurb: championData.blurb,
          image: championData.image,
          tags: championData.tags,
          partype: championData.partype || 'Aucune',
          stats: championData.stats,
          patch: latestPatch.version,
        });
        await champion.save();
      }
    }
  }

  async getChampionByPatch(id: string, patch: string): Promise<ChampionDocument | null> {
    return await this.championModel.findOne({ id, patch }).exec();
  }

  async getChampionsByPatch(patch: string): Promise<ChampionDocument[]> {
    return await this.championModel.find({ patch }).exec();
  }
}
