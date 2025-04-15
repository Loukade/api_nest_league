import { Controller, Get, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountDTO } from './dto/account.dto';
import { ChampionMasteryDto } from './dto/champion-mastery.dto';
import { MatchHistoryDto } from './dto/match-history.dto';
import { SummonerDTO } from './dto/summoner.dto';

interface CombinedAccountInfo {
  account: AccountDTO;
  summoner: SummonerDTO;
  champion_mastery: ChampionMasteryDto[];
  match_history?: MatchHistoryDto[];
}

@Controller('account')
export class AccountController {
  constructor(private readonly AccountService: AccountService) {}

  // Ancienne version avec deux appel API

  /* @Get('account/:gameName/:tagLine')
  // async getPuuid(
  //   @Param('gameName') gameName: string,
  //   @Param('tagLine') tagLine: string,
  // ): Promise<AccountDTO> {
  //   return this.lolService.getAccountByRiotId(gameName, tagLine);
  // }

  // @Get('account/:encryptedPUUID')
  // async getAccount(
  //   @Param('encryptedPUUID') encryptedPUUID: string,
  // ): Promise<SummonerDTO> {
  //   return this.lolService.getAccountByPUUID(encryptedPUUID);
   } */

  // Nouvelle version en 1 appel API

  @Get(':gameName/:tagLine')
  async getFullAccount(
    @Param('gameName') gameName: string,
    @Param('tagLine') tagLine: string,
  ): Promise<CombinedAccountInfo> {
    return this.AccountService.getFullAccountInfo(gameName, tagLine);
  }

  @Get(':gameName/:tagLine/match-history')
  async getMatchHistory(
    @Param('gameName') gameName: string,
    @Param('tagLine') tagLine: string,
  ): Promise<MatchHistoryDto[]> {
    const account = await this.AccountService.getAccountByRiotId(gameName, tagLine);
    return this.AccountService.getMatchHistoryByPUUID(account.puuid);
  }
}
