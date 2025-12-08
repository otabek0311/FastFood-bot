import { Controller, Get } from '@nestjs/common';
import { BotService } from './bot.service';

@Controller()
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get()
  getHello(): string {
    return '🍔 Fast Food Botiga xush kelibsiz! Telegram-da @FastFoodBot izlang va /start buyrug\'ini yuboring.';
  }

  @Get('users')
  async getAllUsers() {
    return await this.botService.findAll();
  }
}
