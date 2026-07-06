import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthRefreshTokenDocument = HydratedDocument<AuthRefreshToken>;

@Schema({ timestamps: true, collection: 'auth_refresh_tokens' })
export class AuthRefreshToken {
  @Prop({ required: true, trim: true, index: true })
  userId: string;

  @Prop({ required: true, trim: true, unique: true, index: true })
  refreshTokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  revoked: boolean;
}

export const AuthRefreshTokenSchema = SchemaFactory.createForClass(AuthRefreshToken);
