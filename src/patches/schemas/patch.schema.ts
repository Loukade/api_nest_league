import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PatchDocument = HydratedDocument<Patch>;

@Schema()
export class Patch {
  @Prop({ required: true, unique: true })
  version: string;
}

export const PatchSchema = SchemaFactory.createForClass(Patch);
