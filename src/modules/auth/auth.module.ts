import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from 'src/shared/redis/redis.module';
import { UsersModule } from '../users/users.module';
import { AuthRepository } from './auth.repo';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import {
  AuthRefreshToken,
  AuthRefreshTokenSchema,
} from './schemas/auth.schema';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    MongooseModule.forFeature([
      { name: AuthRefreshToken.name, schema: AuthRefreshTokenSchema },
    ]),
  ],
  providers: [AuthResolver, AuthService, AuthRepository],
})
export class AuthModule {}
