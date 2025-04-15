import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Account, AccountSchema } from './schemas/account.schema';

@Module({
  imports: [HttpModule, MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }])],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
