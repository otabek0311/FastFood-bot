import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type BotDocument = HydratedDocument<Bot>;

@Schema({versionKey: false})
export class Bot {
  @Prop()
  chatId: string;

  @Prop()
  firstName: string;

  @Prop({ type: String, default: null })
  phoneNumber: string | null;

  @Prop({ type: String, default: null })
  location: string | null;

  @Prop({ type: Array, default: [] })
  orders: any[];

  @Prop({ type: String, default: null })
  currentCart: string | null;
}


export const BotSchema = SchemaFactory.createForClass(Bot);