import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bot, BotDocument } from './model/bot.schema';
import TelegramBot from "node-telegram-bot-api";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface UserSession {
  chatId: string;
  firstName: string;
  step: string;
  phoneNumber?: string;
  location?: string;
  cart: any[];
}

@Injectable()
export class BotService {
  bot: TelegramBot;
  private userSessions: Map<string, UserSession> = new Map();
  
  private products: Product[] = [
    // Ichimliklar
    { id: '1', name: 'Coca-Cola', price: 5000, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Gazli ichimlik', category: 'ichimliklar' },
    { id: '2', name: 'Fanta', price: 4500, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Apelsin ta\'ami', category: 'ichimliklar' },
    { id: '3', name: 'Sprite', price: 4500, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Limon ta\'ami', category: 'ichimliklar' },
    { id: '4', name: 'Qahva', price: 6000, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Issiq qahva', category: 'ichimliklar' },
    
    // Yeguliklar
    { id: '5', name: 'Burger', price: 15000, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Mol go\'shti, pomidor, salat', category: 'yeguliklar' },
    { id: '6', name: 'Pizza', price: 25000, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Peynir, pomidor, kolbasa', category: 'yeguliklar' },
    { id: '7', name: 'Shawarma', price: 12000, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Tovuq go\'shti, sabzavot', category: 'yeguliklar' },
    { id: '8', name: 'Osh', price: 8000, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Osh, sabzavot, go\'sht', category: 'yeguliklar' },
    
    // Shirinliklar
    { id: '9', name: 'Tort', price: 20000, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Shokolad torti', category: 'shirinliklar' },
    { id: '10', name: 'Keks', price: 5000, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Vanilya keksi', category: 'shirinliklar' },
    { id: '11', name: 'Donuts', price: 8000, image: 'https://i.pinimg.com/564x/c9/1e/3d/c91e3d3c3d3c3d3c3d3c3d3c3d3c3d3c.jpg', description: 'Shokolad donuts', category: 'shirinliklar' },
  ];

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
      const chatId = msg.chat.id.toString();
      const firstName = msg.from?.first_name || 'Foydalanuvchi';
      
      // Foydalanuvchini bazaga saqlash
      const existingUser = await this.findOne(chatId);
      if (!existingUser) {
        await this.create(chatId, firstName);
      }

      // Session yaratish
      this.userSessions.set(chatId, {
        chatId,
        firstName,
        step: 'phone',
        cart: [],
      });

      const keyboard = {
        one_time_keyboard: true,
        keyboard: [
          [{ text: '📱 Telefon raqamni yuboring', request_contact: true }],
        ],
      };

      await this.bot.sendMessage(
        chatId,
        '🍔 Fast Food Botiga xush kelibsiz!\n\nIltimos, telefon raqamingizni yuboring:',
        { reply_markup: keyboard },
      );
    });

    // Telefon raqam qabul qilish
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id.toString();
      const userSession = this.userSessions.get(chatId);

      if (!userSession) {
        return;
      }

      // Agar buyruq bo'lsa, o'tkazib yubor
      if (msg.text?.startsWith('/')) {
        return;
      }

      if (userSession.step === 'phone') {
        // Telegram dan yuborilgan telefon raqamni qabul qilish
        if (msg.contact) {
          userSession.phoneNumber = msg.contact.phone_number;
        } else if (msg.text) {
          userSession.phoneNumber = msg.text;
        } else {
          await this.bot.sendMessage(chatId, 'Iltimos, telefon raqamni yuboring!');
          return;
        }
        
        userSession.step = 'location';
        
        const locationKeyboard = {
          one_time_keyboard: true,
          keyboard: [
            [{ text: '📍 Joylashuvni yuboring', request_location: true }],
          ],
        };
        
        await this.bot.sendMessage(
          chatId,
          '📍 Iltimos, joylashuvingizni yuboring:',
          { reply_markup: locationKeyboard },
        );
      } else if (userSession.step === 'location') {
        // Telegram dan yuborilgan joylashuvni qabul qilish
        if (msg.location) {
          userSession.location = `${msg.location.latitude}, ${msg.location.longitude}`;
        } else if (msg.text) {
          userSession.location = msg.text;
        } else {
          await this.bot.sendMessage(chatId, 'Iltimos, joylashuvni yuboring!');
          return;
        }
        
        userSession.step = 'category';

        // Foydalanuvchini yangilash
        await this.update(chatId, {
          phoneNumber: userSession.phoneNumber,
          location: userSession.location,
        });

        // Kategoriya tanlash
        await this.sendCategoryMenu(chatId);
      } else if (userSession.step === 'product_quantity') {
        const quantity = parseInt(msg.text || '0', 10);
        if (isNaN(quantity) || quantity <= 0) {
          await this.bot.sendMessage(chatId, 'Iltimos, to\'g\'ri miqdorni kiriting!');
          return;
        }

        const lastProduct = userSession.cart[userSession.cart.length - 1];
        lastProduct.quantity = quantity;
        lastProduct.total = lastProduct.price * quantity;

        userSession.step = 'category';
        
        const keyboard = {
          inline_keyboard: [
            [{ text: '➕ Yana mahsulot qo\'shish', callback_data: 'back_to_category' }],
            [{ text: '✅ Buyurtmani tasdiqlash', callback_data: 'confirm_order' }],
          ],
        };

        await this.bot.sendMessage(
          chatId,
          `✅ "${lastProduct.name}" ${quantity} ta qo'shildi!\n\nNarxi: ${lastProduct.total.toLocaleString()} so'm`,
          { reply_markup: keyboard },
        );
      }
    });

    // Callback query (tugmalar)
    this.bot.on('callback_query', async (query) => {
      if (!query.message) {
        return;
      }
      
      const chatId = query.message.chat.id.toString();
      const userSession = this.userSessions.get(chatId);

      if (!userSession) {
        return;
      }

      const data = query.data;

      if (!data) {
        return;
      }

      if (data === 'back_to_category') {
        await this.sendCategoryMenu(chatId);
      } else if (data.startsWith('category_')) {
        const category = data.replace('category_', '');
        await this.sendProductsByCategory(chatId, category);
      } else if (data.startsWith('product_')) {
        const productId = data.replace('product_', '');
        await this.sendProductDetails(chatId, productId);
      } else if (data.startsWith('add_to_cart_')) {
        const productId = data.replace('add_to_cart_', '');
        const product = this.products.find(p => p.id === productId);
        
        if (product) {
          userSession.cart.push({ ...product, quantity: 0 });
          userSession.step = 'product_quantity';
          
          await this.bot.sendMessage(
            chatId,
            `"${product.name}" uchun miqdorni kiriting:`,
          );
        }
      } else if (data === 'confirm_order') {
        await this.confirmOrder(chatId);
      } else if (data === 'final_confirm') {
        const userSession = this.userSessions.get(chatId);
        if (userSession) {
          await this.bot.sendMessage(
            chatId,
            '✅ Buyurtma qabul qilindi!\n\n🚗 Tez orada yetkazib beriladi.\n\n/start - Yangi buyurtma berish',
          );
          userSession.cart = [];
          userSession.step = 'category';
        }
      } else if (data === 'cancel_order') {
        const userSession = this.userSessions.get(chatId);
        if (userSession) {
          await this.bot.sendMessage(
            chatId,
            '❌ Buyurtma bekor qilindi.\n\n/start - Yangi buyurtma berish',
          );
          userSession.cart = [];
          userSession.step = 'category';
        }
      }

      await this.bot.answerCallbackQuery(query.id);
    });
  }

  private async sendCategoryMenu(chatId: string) {
    const keyboard = {
      inline_keyboard: [
        [{ text: '🥤 Ichimliklar', callback_data: 'category_ichimliklar' }],
        [{ text: '� Yeguliklar', callback_data: 'category_yeguliklar' }],
        [{ text: '🍰 Shirinliklar', callback_data: 'category_shirinliklar' }],
      ],
    };

    await this.bot.sendMessage(
      chatId,
      '📋 Kategoriyani tanlang:',
      { reply_markup: keyboard },
    );
  }

  private async sendProductsByCategory(chatId: string, category: string) {
    const products = this.products.filter(p => p.category === category);
    
    const keyboard = {
      inline_keyboard: products.map(product => [
        { text: `${product.name} - ${product.price.toLocaleString()} so'm`, callback_data: `product_${product.id}` },
      ]),
    };

    const categoryNames = {
      ichimliklar: '🥤 Ichimliklar',
      yeguliklar: '🍕 Yeguliklar',
      shirinliklar: '🍰 Shirinliklar',
    };

    keyboard.inline_keyboard.push([
      { text: '⬅️ Orqaga', callback_data: 'back_to_category' },
    ]);

    await this.bot.sendMessage(
      chatId,
      `${categoryNames[category] || category} ro'yxati:`,
      { reply_markup: keyboard },
    );
  }

  private async sendProductDetails(chatId: string, productId: string) {
    const product = this.products.find(p => p.id === productId);
    
    if (!product) {
      await this.bot.sendMessage(chatId, 'Mahsulot topilmadi!');
      return;
    }

    const keyboard = {
      inline_keyboard: [
        [{ text: '🛒 Buyurtma berish', callback_data: `add_to_cart_${product.id}` }],
        [{ text: '⬅️ Orqaga', callback_data: `category_${product.category}` }],
      ],
    };

    const message = `
📦 ${product.name}
💰 Narxi: ${product.price.toLocaleString()} so'm
📝 Tarkibi: ${product.description}
    `;

    await this.bot.sendMessage(
      chatId,
      message.trim(),
      { reply_markup: keyboard },
    );
  }

  private async confirmOrder(chatId: string) {
    const userSession = this.userSessions.get(chatId);
    
    if (!userSession || userSession.cart.length === 0) {
      await this.bot.sendMessage(chatId, 'Savat bo\'sh!');
      return;
    }

    let orderText = '📦 Sizning buyurtmangiz:\n\n';
    let totalPrice = 0;

    userSession.cart.forEach((item, index) => {
      orderText += `${index + 1}. ${item.name} x${item.quantity} = ${item.total.toLocaleString()} so'm\n`;
      totalPrice += item.total;
    });

    orderText += `\n💰 Jami: ${totalPrice.toLocaleString()} so'm`;
    orderText += `\n📞 Telefon: ${userSession.phoneNumber}`;
    orderText += `\n📍 Manzil: ${userSession.location}`;

    // Buyurtmani bazaga saqlash
    await this.update(chatId, {
      orders: userSession.cart,
    });

    const keyboard = {
      inline_keyboard: [
        [{ text: '✅ Tasdiqlash', callback_data: 'final_confirm' }],
        [{ text: '❌ Bekor qilish', callback_data: 'cancel_order' }],
      ],
    };

    await this.bot.sendMessage(
      chatId,
      orderText,
      { reply_markup: keyboard },
    );
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
