import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClientType;

  constructor(private readonly config: ConfigService) {
    const url =
      this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';

    this.client = createClient({ url });
    this.client.on('error', (error) => {
      this.logger.error('Redis connection error', error);
    });
  }

  async onModuleInit(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
      this.logger.log('Redis connected');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  async setRefreshToken(
    userId: string,
    refreshToken: string,
    ttlSeconds?: number,
  ): Promise<void> {
    const ttl =
      ttlSeconds ??
      this.config.get<number>('REFRESH_TOKEN_TTL_SECONDS') ??
      7 * 24 * 60 * 60;

    await this.client.set(this.getRefreshTokenKey(userId), refreshToken, {
      EX: ttl,
    });
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.client.get(this.getRefreshTokenKey(userId));
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    await this.client.del(this.getRefreshTokenKey(userId));
  }

  async deleteRefreshTokenValue(refreshToken: string): Promise<void> {
    const keys = await this.client.keys('auth:refresh-token:*');

    for (const key of keys) {
      const storedToken = await this.client.get(key);

      if (storedToken === refreshToken) {
        await this.client.del(key);
        return;
      }
    }
  }

  private getRefreshTokenKey(userId: string): string {
    return `auth:refresh-token:${userId}`;
  }
}
