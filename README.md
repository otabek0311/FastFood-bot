# 🍔 Fast Food Yetkazib Berish Boti

Mini fast food yetkazib berish Telegram boti. NestJS va MongoDB bilan yozilgan.

## 📋 Xususiyatlar

- **Telefon raqam so'rash** - Foydalanuvchining telefon raqamini olish
- **Location so'rash** - Yetkazib berish manzilini olish
- **Kategoriyalar** - 3 ta asosiy kategoriya:
  - 🥤 Ichimliklar (Coca-Cola, Fanta, Qahva va boshqalar)
  - 🍕 Yeguliklar (Burger, Pizza, Shawarma, Osh)
  - 🍰 Shirinliklar (Tort, Keks, Donuts)
  
- **Mahsulot Tafsilotlari** - Har bir mahsulot uchun:
  - Nomi
  - Narxi
  - Rasmi
  - Tarkibi (tavsifi)
  - "Buyurtma berish" tugmasi
  
- **Savat** - Bir nechta mahsulotni tanlash va buyurtma berish
- **Buyurtma Tasdiqlash** - Jami narx, telefon, manzil bilan tasdiqlovchi xabar

## O'rnatish va Ishga Tushirish

### O'rnatish

```bash
npm install
```

### Environment o'zgaruvchilari

`.env` faylini yarating va quyidagi ma'lumotlarni qo'shing:

```bash
BOT_TOKEN=your_telegram_bot_token
MONGO_URI=mongodb://localhost:27017/fastfood
PORT=3000
```

### Ishga Tushirish

```bash
# Development rejimida
npm run start:dev

# Production rejimida
npm run start:prod
```

## Bot Komandalar

- `/start` - Botni ishga tushirish va buyurtma jarayonini boshlash
- Telefon raqam - Foydalanuvchining telefon raqamini kiritish
- Location - Yetkazib berish manzilini kiritish
- Kategoriya tanlash - Ichimliklar, Yeguliklar yoki Shirinliklar
- Mahsulot tanlash - Tafsilotlarni ko'rish
- Miqdor kiritish - Mahsulot miqdorini belgilash
- Buyurtma tasdiqlash - Buyurtmani yakuniy tasdiqlash

## Database Schema

```typescript
Bot {
  chatId: string;
  firstName: string;
  phoneNumber?: string;
  location?: string;
  orders: any[];
  currentCart?: string;
}
```

## Texnologiyalar

- **NestJS** - Backend framework
- **TypeScript** - Dasturlash tili
- **MongoDB** - Database
- **Mongoose** - ODM
- **Telegram Bot API** - Bot integratsiyasi

## Mahsulotlar

Bot-da oldindan 11 ta mahsulot mavjud:

**Ichimliklar:**
- Coca-Cola (5000 so'm)
- Fanta (4500 so'm)
- Sprite (4500 so'm)
- Qahva (6000 so'm)

**Yeguliklar:**
- Burger (15000 so'm)
- Pizza (25000 so'm)
- Shawarma (12000 so'm)
- Osh (8000 so'm)

**Shirinliklar:**
- Tort (20000 so'm)
- Keks (5000 so'm)
- Donuts (8000 so'm)

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
