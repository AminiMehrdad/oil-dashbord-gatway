import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuthRefreshTokenDocument = HydratedDocument<AuthRefreshToken>;

@Schema({ timestamps: true, collection: 'auth_refresh_tokens' })
export class AuthRefreshToken {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  refreshToken: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: false })
  revoked: boolean;
}

export const AuthRefreshTokenSchema =
  SchemaFactory.createForClass(AuthRefreshToken);
