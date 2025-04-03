import { Controller, Get, Param } from '@nestjs/common';
import { AccountDTO } from './dto/account.dto';
import { SummonerDTO } from './dto/summoner.dto';
import { LolService } from './lol.service';

interface CombinedAccountInfo {
  account: AccountDTO;
  summoner: SummonerDTO;
}

@Controller('lol')
export class LolController {
  constructor(private readonly lolService: LolService) {}

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

  @Get('account/:gameName/:tagLine')
  async getFullAccount(
    @Param('gameName') gameName: string,
    @Param('tagLine') tagLine: string,
  ): Promise<CombinedAccountInfo> {
    return this.lolService.getFullAccountInfo(gameName, tagLine);
  }
}
