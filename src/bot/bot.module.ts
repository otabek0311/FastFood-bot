import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { Bot, BotSchema } from './model/bot.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bot.name, schema: BotSchema }])],
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {}
