import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { AccountDTO } from './dto/account.dto';
import { ChampionMasteryDto } from './dto/champion-mastery.dto';
import { MatchHistoryDto } from './dto/match-history.dto';
import { RankedDto } from './dto/ranked.dto';
import { SummonerDTO } from './dto/summoner.dto';
import { Account, AccountDocument } from './schemas/account.schema';

interface CombinedAccountInfo {
  account: AccountDTO;
  summoner: SummonerDTO;
  champion_mastery: ChampionMasteryDto[];
  match_history?: MatchHistoryDto[];
  ranked?: RankedDto[];
}

dotenv.config();

@Injectable()
export class AccountService {
  private readonly API_KEY = process.env.RIOT_API_KEY;
  private readonly BASE_URL = 'https://euw1.api.riotgames.com/lol';
  private readonly BASE_URL_EUROPE = 'https://europe.api.riotgames.com';
  private readonly MATCH_HISTORY_COUNT = 20;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private lastApiCall = 0;
  private readonly API_CALL_INTERVAL = 1200; // 1.2 secondes entre chaque appel

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
  ) {}

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    if (timeSinceLastCall < this.API_CALL_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.API_CALL_INTERVAL - timeSinceLastCall));
    }
    this.lastApiCall = Date.now();
  }

  async getFullAccountInfo(gameName: string, tagLine: string): Promise<CombinedAccountInfo> {
    let account = await this.accountModel.findOne({ gameName, tagLine }).exec();

    const cacheExpired = new Date(Date.now() - this.CACHE_DURATION);
    if (!account || account.lastUpdated < cacheExpired) {
      await this.waitForRateLimit();
      const accountInfo = await this.getAccountByRiotId(gameName, tagLine);

      await this.waitForRateLimit();
      const summonerInfo = await this.getAccountByPUUID(accountInfo.puuid);

      await this.waitForRateLimit();
      const championMastery = await this.getChampionMasteryByPUUID(accountInfo.puuid);

      await this.waitForRateLimit();
      const matchHistory = await this.getMatchHistoryByPUUID(accountInfo.puuid);

      await this.waitForRateLimit();
      const ranked = await this.getRankedBySummonerId(summonerInfo.id);

      if (!account) {
        account = new this.accountModel({
          puuid: accountInfo.puuid,
          gameName,
          tagLine,
          summonerInfo,
          championMastery,
          matchHistory,
          ranked,
          lastUpdated: new Date(),
          updateCount: 1,
        });
      } else {
        account.summonerInfo = summonerInfo;
        account.championMastery = championMastery;
        account.matchHistory = matchHistory;
        account.ranked = ranked;
        account.lastUpdated = new Date();
        account.updateCount += 1;
      }

      await account.save();
    }

    return {
      account: {
        puuid: account.puuid,
        gameName: account.gameName,
        tagLine: account.tagLine,
      },
      summoner: account.summonerInfo,
      champion_mastery: account.championMastery,
      match_history: account.matchHistory,
      ranked: account.ranked,
    };
  }

  async getAccountByRiotId(gameName: string, tagLine: string): Promise<AccountDTO> {
    const url =
      this.BASE_URL_EUROPE + `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
    const headers = { 'X-Riot-Token': this.API_KEY };

    try {
      const response = await firstValueFrom(this.httpService.get<AccountDTO>(url, { headers }));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10 secondes
        return this.getAccountByRiotId(gameName, tagLine); // Réessayer
      }
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
      if (axiosError.response?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return this.getAccountByPUUID(encryptedPUUID);
      }
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
      if (axiosError.response?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return this.getChampionMasteryByPUUID(encryptedPUUID);
      }
      throw new HttpException(
        axiosError.response?.data || 'Erreur API Riot',
        axiosError.response?.status || 500,
      );
    }
  }

  async getMatchHistoryByPUUID(encryptedPUUID: string): Promise<MatchHistoryDto[]> {
    const url =
      this.BASE_URL_EUROPE +
      `/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=${this.MATCH_HISTORY_COUNT}`;
    const headers = { 'X-Riot-Token': this.API_KEY };

    try {
      const response = await firstValueFrom(this.httpService.get<string[]>(url, { headers }));
      const matchIds = response.data;

      const matchPromises = matchIds.map(async matchId => {
        await this.waitForRateLimit();
        const matchUrl = this.BASE_URL_EUROPE + `/lol/match/v5/matches/${matchId}`;
        const matchResponse = await firstValueFrom(
          this.httpService.get<MatchHistoryDto>(matchUrl, { headers }),
        );
        return matchResponse.data;
      });

      return await Promise.all(matchPromises);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return this.getMatchHistoryByPUUID(encryptedPUUID);
      }
      throw new HttpException(
        axiosError.response?.data || 'Erreur API Riot',
        axiosError.response?.status || 500,
      );
    }
  }

  async getRankedBySummonerId(encryptedSummonerId: string): Promise<RankedDto[]> {
    const url = this.BASE_URL + `/league/v4/entries/by-summoner/${encryptedSummonerId}`;
    const headers = { 'X-Riot-Token': this.API_KEY };

    try {
      const response = await firstValueFrom(this.httpService.get<RankedDto[]>(url, { headers }));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return this.getRankedBySummonerId(encryptedSummonerId);
      }
      throw new HttpException(
        axiosError.response?.data || 'Erreur API Riot',
        axiosError.response?.status || 500,
      );
    }
  }
}
