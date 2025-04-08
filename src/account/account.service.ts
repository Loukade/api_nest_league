import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import { firstValueFrom } from 'rxjs';
import { AccountDTO } from './dto/account.dto';
import { ChampionMasteryDto } from './dto/champion-mastery.dto';
import { SummonerDTO } from './dto/summoner.dto';

interface CombinedAccountInfo {
  account: AccountDTO;
  summoner: SummonerDTO;
  champion_mastery: ChampionMasteryDto[];
}

dotenv.config();

@Injectable()
export class AccountService {
  private readonly API_KEY = process.env.RIOT_API_KEY;
  private readonly BASE_URL = 'https://euw1.api.riotgames.com/lol';
  private readonly BASE_URL_EUROPE = 'https://europe.api.riotgames.com/riot';

  constructor(private readonly httpService: HttpService) {}

  async getFullAccountInfo(gameName: string, tagLine: string): Promise<CombinedAccountInfo> {
    const account = await this.getAccountByRiotId(gameName, tagLine);
    const summoner = await this.getAccountByPUUID(account.puuid);
    const champion_mastery = await this.getChampionMasteryByPUUID(account.puuid);
    return { account, summoner, champion_mastery };
  }

  async getAccountByRiotId(gameName: string, tagLine: string): Promise<AccountDTO> {
    const url = this.BASE_URL_EUROPE + `/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
    const headers = { 'X-Riot-Token': this.API_KEY };

    try {
      const response = await firstValueFrom(this.httpService.get<AccountDTO>(url, { headers }));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        axiosError.response?.data || 'Erreur API Riot',
        axiosError.response?.status || 500,
      );
    }
  }

  async getAccountByPUUID(encryptedPUUID: string): Promise<SummonerDTO> {
    const url = this.BASE_URL + `/summoner/v4/summoners/by-puuid/${encryptedPUUID}`;
    const headers = { 'X-Riot-Token': this.API_KEY };

    try {
      const response = await firstValueFrom(this.httpService.get<SummonerDTO>(url, { headers }));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        axiosError.response?.data || 'Erreur API Riot',
        axiosError.response?.status || 500,
      );
    }
  }

  async getChampionMasteryByPUUID(encryptedPUUID: string): Promise<ChampionMasteryDto[]> {
    const url =
      this.BASE_URL + `/champion-mastery/v4/champion-masteries/by-puuid/${encryptedPUUID}/top`;
    const headers = { 'X-Riot-Token': this.API_KEY };

    try {
      const response = await firstValueFrom(
        this.httpService.get<ChampionMasteryDto[]>(url, { headers }),
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
