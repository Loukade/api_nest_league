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
import { SummonerDTO } from './dto/summoner.dto';
import { Account, AccountDocument } from './schemas/account.schema';

interface CombinedAccountInfo {
  account: AccountDTO;
  summoner: SummonerDTO;
  champion_mastery: ChampionMasteryDto[];
  match_history?: MatchHistoryDto[];
}

dotenv.config();

@Injectable()
export class AccountService {
  private readonly API_KEY = process.env.RIOT_API_KEY;
  private readonly BASE_URL = 'https://euw1.api.riotgames.com/lol';
  private readonly BASE_URL_EUROPE = 'https://europe.api.riotgames.com';
  private readonly MATCH_HISTORY_COUNT = 20;

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
  ) {}

  async getFullAccountInfo(gameName: string, tagLine: string): Promise<CombinedAccountInfo> {
    let account = await this.accountModel.findOne({ gameName, tagLine }).exec();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!account || account.lastUpdated < oneHourAgo) {
      const accountInfo = await this.getAccountByRiotId(gameName, tagLine);
      const summonerInfo = await this.getAccountByPUUID(accountInfo.puuid);
      const championMastery = await this.getChampionMasteryByPUUID(accountInfo.puuid);
      const matchHistory = await this.getMatchHistoryByPUUID(accountInfo.puuid);

      if (!account) {
        account = new this.accountModel({
          puuid: accountInfo.puuid,
          gameName,
          tagLine,
          summonerInfo,
          championMastery,
          matchHistory,
          lastUpdated: new Date(),
          updateCount: 1,
        });
      } else {
        account.summonerInfo = summonerInfo;
        account.championMastery = championMastery;
        account.matchHistory = matchHistory;
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

  async getMatchHistoryByPUUID(encryptedPUUID: string): Promise<MatchHistoryDto[]> {
    const url =
      this.BASE_URL_EUROPE +
      `/lol/match/v5/matches/by-puuid/${encryptedPUUID}/ids?start=0&count=${this.MATCH_HISTORY_COUNT}`;
    const headers = { 'X-Riot-Token': this.API_KEY };

    try {
      const response = await firstValueFrom(this.httpService.get<string[]>(url, { headers }));
      const matchIds = response.data;

      const matchPromises = matchIds.map(async matchId => {
        const matchUrl = this.BASE_URL_EUROPE + `/lol/match/v5/matches/${matchId}`;
        const matchResponse = await firstValueFrom(
          this.httpService.get<MatchHistoryDto>(matchUrl, { headers }),
        );
        return matchResponse.data;
      });

      return await Promise.all(matchPromises);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        axiosError.response?.data || 'Erreur API Riot',
        axiosError.response?.status || 500,
      );
    }
  }
}
