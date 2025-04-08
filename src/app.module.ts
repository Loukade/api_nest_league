import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChampionsModule } from './champions/champions.module';
import { PatchesModule } from './patches/patches.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/league-api'),
    HttpModule,
    AccountModule,
    ChampionsModule,
    PatchesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
