import { Controller, Get, Param } from '@nestjs/common';
import { AccountDTO } from './dto/account.dto';
import { LolService } from './lol.service';

@Controller('lol')
export class LolController {
  constructor(private readonly lolService: LolService) {}

  @Get('account/:gameName/:tagLine')
  async getAccount(
    @Param('gameName') gameName: string,
    @Param('tagLine') tagLine: string,
  ): Promise<AccountDTO> {
    return this.lolService.getAccountByRiotId(gameName, tagLine);
  }
}
