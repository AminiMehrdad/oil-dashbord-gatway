import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RabbitModule } from 'src/common/rabbit/rabbit.module';
import { RedisModule } from 'src/shared/redis/redis.module';
import {
  AuthRefreshToken,
  AuthRefreshTokenSchema,
} from './entity/auth-refresh-token.schema';
import { AuthResolver } from './resolvers/auth.resolver';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    RabbitModule,
    RedisModule,
    MongooseModule.forFeature([
      { name: AuthRefreshToken.name, schema: AuthRefreshTokenSchema },
    ]),
  ],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}
