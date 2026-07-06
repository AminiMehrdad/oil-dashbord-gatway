import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthInput } from './inputs/create-auth.input';
import {
  AuthRefreshToken,
  AuthRefreshTokenDocument,
} from './schemas/auth.schema';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(AuthRefreshToken.name)
    private readonly authModel: Model<AuthRefreshTokenDocument>,
  ) {}

  async create(input: CreateAuthInput): Promise<AuthRefreshTokenDocument> {
    return this.authModel.create(input);
  }

  async upsertActiveToken(input: CreateAuthInput): Promise<AuthRefreshTokenDocument> {
    return this.authModel
      .findOneAndUpdate(
        { userId: input.userId, revoked: false },
        {
          $set: {
            userId: input.userId,
            refreshTokenHash: input.refreshTokenHash,
            expiresAt: input.expiresAt ?? new Date(),
            revoked: false,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  async findByUserId(userId: string): Promise<AuthRefreshTokenDocument | null> {
    return this.authModel.findOne({ userId }).exec();
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<AuthRefreshTokenDocument | null> {
    return this.authModel.findOne({ refreshTokenHash }).exec();
  }

  async findActiveByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<AuthRefreshTokenDocument | null> {
    return this.authModel
      .findOne({
        refreshTokenHash,
        revoked: false,
        expiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async revokeByUserId(userId: string): Promise<void> {
    await this.authModel
      .updateMany({ userId, revoked: false }, { $set: { revoked: true } })
      .exec();
  }

  async revokeByRefreshTokenHash(refreshTokenHash: string): Promise<void> {
    await this.authModel
      .updateMany({ refreshTokenHash, revoked: false }, { $set: { revoked: true } })
      .exec();
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.authModel.deleteMany({ userId }).exec();
  }
}
