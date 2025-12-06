import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bot, BotDocument } from './model/bot.schema';
import TelegramBot from "node-telegram-bot-api";

interface MathQuestion {
  question: string;
  answer: number;
  id: number;
}

@Injectable()
export class BotService {
  bot: TelegramBot;
  private userSessions: Map<string, any> = new Map();

  constructor(@InjectModel(Bot.name) private botModel: Model<BotDocument>) {
    if (!process.env.BOT_TOKEN) {
      throw new Error('BOT_TOKEN environment variable is not defined');
    }
    this.bot = new TelegramBot(process.env.BOT_TOKEN as string, {polling: true});
    this.setupBotHandlers();
  }

  private setupBotHandlers() {
    // /start buyrug'i
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'Foydalanuvchi';
      
      await this.bot.sendMessage(
        chatId,
        'Matematik Quiz Botiga xush kelibsiz! 🎓\n\n/start_quiz - Quizni boshlash',
      );
      
      // Foydalanuvchini bazaga saqlash
      const existingUser = await this.findOne(chatId.toString());
      if (!existingUser) {
        await this.create(chatId.toString(), firstName);
      }
    });

    // /start_quiz buyrug'i
    this.bot.onText(/\/start_quiz/, async (msg) => {
      const chatId = msg.chat.id;
      const questions = this.generateQuestions(10);
      
      this.userSessions.set(chatId.toString(), {
        chatId: chatId.toString(),
        questions,
        currentIndex: 0,
        correctAnswers: 0,
        totalAnswered: 0,
      });

      const firstQuestion = questions[0];
      await this.bot.sendMessage(
        chatId,
        `Savol 1/10:\n\n${firstQuestion.question}\n\nJavobni raqam sifatida yuboring.`,
      );
    });

    // Raqam javoblarini qabul qilish
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id.toString();
      const userSession = this.userSessions.get(chatId);

      // Agar buyruq bo'lsa, o'tkazib yubor
      if (msg.text?.startsWith('/')) {
        return;
      }

      if (!userSession) {
        return;
      }

      const answer = parseInt(msg.text || '0', 10);
      if (isNaN(answer)) {
        await this.bot.sendMessage(chatId, 'Iltimos, raqam yuboring!');
        return;
      }

      const currentQuestion = userSession.questions[userSession.currentIndex];
      const isCorrect = currentQuestion.answer === answer;

      if (isCorrect) {
        userSession.correctAnswers++;
        await this.bot.sendMessage(chatId, '✅ To\'g\'ri javob!');
      } else {
        await this.bot.sendMessage(
          chatId,
          `❌ Noto\'g\'ri javob. To\'g\'ri javob: ${currentQuestion.answer}`,
        );
      }

      userSession.currentIndex++;
      userSession.totalAnswered++;

      if (userSession.totalAnswered === userSession.questions.length) {
        // Quiz tugadi
        const percentage = Math.round(
          (userSession.correctAnswers / userSession.questions.length) * 100,
        );
        
        await this.bot.sendMessage(
          chatId,
          `🎉 Quiz tugadi!\n\nNatija: ${userSession.correctAnswers}/${userSession.questions.length} (${percentage}%)\n\n/start_quiz - Yana quizni boshlash`,
        );

        // Natijani bazaga saqlash
        await this.update(chatId, {
          testScore: userSession.correctAnswers,
          isTesting: false,
        });

        this.userSessions.delete(chatId);
      } else {
        // Keyingi savol
        const nextQuestion = userSession.questions[userSession.currentIndex];
        const questionNumber = userSession.currentIndex + 1;
        await this.bot.sendMessage(
          chatId,
          `Savol ${questionNumber}/10:\n\n${nextQuestion.question}`,
        );
      }
    });
  }

  generateQuestions(count: number): MathQuestion[] {
    const questions: MathQuestion[] = [];

    for (let i = 0; i < count; i++) {
      const num1 = Math.floor(Math.random() * 100) + 1;
      const num2 = Math.floor(Math.random() * 100) + 1;
      const operationType = Math.floor(Math.random() * 4);

      let question: string;
      let answer: number;

      switch (operationType) {
        case 0: // Qo'shish
          question = `${num1} + ${num2} = ?`;
          answer = num1 + num2;
          break;
        case 1: // Ayirish
          question = `${num1} - ${num2} = ?`;
          answer = num1 - num2;
          break;
        case 2: // Ko'paytirish
          question = `${num1} * ${num2} = ?`;
          answer = num1 * num2;
          break;
        case 3: // Bo'lish (butun sonlar)
          const divisor = Math.floor(Math.random() * 10) + 1;
          const dividend = divisor * (Math.floor(Math.random() * 10) + 1);
          question = `${dividend} / ${divisor} = ?`;
          answer = dividend / divisor;
          break;
        default:
          question = `${num1} + ${num2} = ?`;
          answer = num1 + num2;
      }

      questions.push({
        question,
        answer,
        id: i + 1,
      });
    }

    return questions;
  }

  async create(chatId: string, firstName: string) {
    const newBot = await this.botModel.create({ chatId, firstName });
    return newBot;
  }

  async findAll() {
    return await this.botModel.find();
  }

  async findOne(chatId: string) {
    return await this.botModel.findOne({ chatId });
  }

  async update(chatId: string, updateData: any) {
    return await this.botModel.findOneAndUpdate({ chatId }, updateData, { new: true });
  }

  async remove(chatId: string) {
    return await this.botModel.findOneAndDelete({ chatId });
  }
}
