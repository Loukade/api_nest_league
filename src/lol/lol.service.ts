import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import { firstValueFrom } from 'rxjs';
import { AccountDTO } from './dto/account.dto';

dotenv.config();

@Injectable()
export class LolService {
  private readonly API_KEY = process.env.RIOT_API_KEY;
  private readonly BASE_URL = 'https://euw1.api.riotgames.com/lol';

  constructor(private readonly httpService: HttpService) {}

  async getAccountByRiotId(
    gameName: string,
    tagLine: string,
  ): Promise<AccountDTO> {
    const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
    const headers = { 'X-Riot-Token': this.API_KEY };

    try {
      const response = await firstValueFrom(
        this.httpService.get<AccountDTO>(url, { headers }),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        axiosError.response?.data || 'Erreur API Riot',
        axiosError.response?.status || 500,
      );
    }
  }
}
