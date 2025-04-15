import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ChampionMasteryDto } from '../dto/champion-mastery.dto';
import { MatchHistoryDto } from '../dto/match-history.dto';
import { RankedDto } from '../dto/ranked.dto';
import { SummonerDTO } from '../dto/summoner.dto';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true, unique: true })
  puuid: string;

  @Prop({ required: true })
  gameName: string;

  @Prop({ required: true })
  tagLine: string;

  @Prop({ type: Object })
  summonerInfo: SummonerDTO;

  @Prop([{ type: Object }])
  championMastery: ChampionMasteryDto[];

  @Prop([{ type: Object }])
  matchHistory: MatchHistoryDto[];

  @Prop([{ type: Object }])
  ranked: RankedDto[];

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;

  @Prop({ type: Number, default: 0 })
  updateCount: number;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
