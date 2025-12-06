import { Controller, Get, Post, Body, Session } from '@nestjs/common';
import { BotService } from './bot.service';

interface MathQuestion {
  question: string;
  answer: number;
  id: number;
}

interface UserSession {
  chatId: string;
  questions: MathQuestion[];
  currentIndex: number;
  correctAnswers: number;
  totalAnswered: number;
}

@Controller()
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get()
  getHello(): string {
    return 'Matematik Quiz Botiga xush kelibsiz! /start-quiz ga so\'rov yuboring.';
  }

  @Post('start-quiz')
  async startQuiz(
    @Body() body: { chatId: string; firstName: string },
    @Session() session: any,
  ): Promise<{ questions: MathQuestion[] }> {
    const questions = this.botService.generateQuestions(10);
    
    // Foydalanuvchini bazaga saqlash yoki yangilash
    const existingUser = await this.botService.findOne(body.chatId);
    if (!existingUser) {
      await this.botService.create(body.chatId, body.firstName);
    }
    
    session.userSession = {
      chatId: body.chatId,
      questions,
      currentIndex: 0,
      correctAnswers: 0,
      totalAnswered: 0,
    };
    return { questions };
  }

  @Post('answer')
  async submitAnswer(
    @Body() body: { questionId: number; answer: number },
    @Session() session: any,
  ): Promise<any> {
    const userSession: UserSession = session.userSession;

    if (!userSession) {
      return { error: 'Quiz boshlanmagan. Avval /start-quiz ga so\'rov yuboring.' };
    }

    const question = userSession.questions.find(
      (q) => q.id === body.questionId,
    );

    if (!question) {
      return { error: 'Savol topilmadi.' };
    }

    const isCorrect = question.answer === body.answer;
    if (isCorrect) {
      userSession.correctAnswers++;
    }
    userSession.totalAnswered++;

    const allAnswered = userSession.totalAnswered === userSession.questions.length;

    if (allAnswered) {
      // Natijani bazaga saqlash
      await this.botService.update(userSession.chatId, {
        testScore: userSession.correctAnswers,
        isTesting: false,
      });

      const result = {
        message: 'Quiz tugadi!',
        correctAnswers: userSession.correctAnswers,
        totalQuestions: userSession.questions.length,
        percentage: Math.round(
          (userSession.correctAnswers / userSession.questions.length) * 100,
        ),
        nextAction: 'Yana 10 ta savol uchun /start-quiz ga so\'rov yuboring.',
      };
      session.userSession = null;
      return result;
    }

    const nextQuestion = userSession.questions[userSession.totalAnswered];
    return {
      isCorrect,
      correctAnswer: question.answer,
      nextQuestion,
      progress: `${userSession.totalAnswered}/${userSession.questions.length}`,
    };
  }

  @Get('current-question')
  getCurrentQuestion(@Session() session: any): any {
    const userSession: UserSession = session.userSession;

    if (!userSession) {
      return { error: 'Quiz boshlanmagan.' };
    }

    if (userSession.totalAnswered >= userSession.questions.length) {
      return { error: 'Barcha savollar tugadi.' };
    }

    const currentQuestion = userSession.questions[userSession.totalAnswered];
    return {
      question: currentQuestion,
      progress: `${userSession.totalAnswered + 1}/${userSession.questions.length}`,
    };
  }
}
