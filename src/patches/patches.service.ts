import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Patch, PatchDocument } from './schemas/patch.schema';

@Injectable()
export class PatchesService {
  constructor(
    @InjectModel(Patch.name) private readonly patchModel: Model<PatchDocument>,
    private readonly httpService: HttpService,
  ) {}

  // Fonction pour comparer les versions
  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart !== bPart) {
        return bPart - aPart; // Tri décroissant
      }
    }
    return 0;
  }
  // Récuperer les versions de l'API de Lol
  async fetchAndSavePatches(): Promise<PatchDocument[]> {
    const url = `https://ddragon.leagueoflegends.com/api/versions.json`;
    const response = await firstValueFrom(this.httpService.get<string[]>(url));
    const versions = response.data;

    // Récupérer toutes les versions existantes
    const existingPatches = await this.patchModel.find().exec();
    const existingVersions = existingPatches.map(patch => patch.version);

    // Trouver les versions manquantes
    const missingVersions = versions.filter(version => !existingVersions.includes(version));

    // Insérer les versions manquantes
    const savedPatches: PatchDocument[] = [];
    for (const version of missingVersions) {
      const patch = new this.patchModel({ version });
      const savedPatch = await patch.save();
      savedPatches.push(savedPatch);
    }

    return savedPatches;
  }

  // Récupérer toutes les versions dans la BDD
  async getAllPatches(): Promise<PatchDocument[]> {
    const patches = await this.patchModel.find().exec();
    return patches.sort((a, b) => this.compareVersions(a.version, b.version));
  }

  // Récupérer la dernière version dans la BDD
  async getLatestPatch(): Promise<PatchDocument | null> {
    const patches = await this.patchModel.find().exec();
    if (patches.length === 0) return null;

    return patches.sort((a, b) => this.compareVersions(a.version, b.version))[0];
  }
}
