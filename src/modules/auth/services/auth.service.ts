import { Injectable } from '@nestjs/common';
import { RabbitMQService } from 'src/common/rabbit/rabbitmq.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { AuthPayload } from '../types/auth-payload.model';
import { CreatedUser } from '../types/create-user.output';
import { CreateUserInput } from '../types/create-user.input';
import { LoginInput } from '../types/login.input';
import { LogOutUser } from '../types/logout-user.output';

@Injectable()
export class AuthService {
  constructor(
    private readonly rmq: RabbitMQService,
    private readonly redis: RedisService,
  ) {}

  async createUser(createUserInput: CreateUserInput): Promise<CreatedUser> {
    return this.rmq.requestJson<CreatedUser>(
      'auth.createUser',
      createUserInput,
      10_000,
    );
  }

  async login(loginInput: LoginInput): Promise<AuthPayload> {
    const payload = {
      username: loginInput.emailOrPhone,
      password: loginInput.password,
    };
    const response = await this.rmq.requestJson<AuthPayload>(
      'auth.login',
      payload,
      10_000,
    );

    if (response.refreshToken && response.user?.id) {
      await this.redis.setRefreshToken(response.user.id, response.refreshToken);
    }

    return response;
  }

  async logout(refreshToken: string): Promise<LogOutUser> {
    const response = await this.rmq.requestJson<LogOutUser>(
      'auth.logout',
      { refresh: refreshToken },
      10_000,
    );

    await this.redis.deleteRefreshTokenValue(refreshToken);

    return response;
  }
}
