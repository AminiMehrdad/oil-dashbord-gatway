import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
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
      this.getNumberConfig('REFRESH_TOKEN_TTL_SECONDS') ??
      7 * 24 * 60 * 60;

    await this.client.set(this.getRefreshTokenKey(userId), refreshToken, {
      EX: ttl,
    });
  }

  async setAccessToken(
    accessToken: string,
    payload: unknown,
    ttlSeconds?: number,
  ): Promise<void> {
    const ttl =
      ttlSeconds ?? this.getNumberConfig('ACCESS_TOKEN_TTL_SECONDS') ?? 900;

    await this.client.set(
      this.getAccessTokenKey(accessToken),
      JSON.stringify(payload),
      {
        EX: ttl,
      },
    );

    const userId = this.getPayloadUserId(payload);
    if (userId) {
      await this.client.set(this.getUserAccessTokenKey(userId), accessToken, {
        EX: ttl,
      });
    }
  }

  async getAccessTokenPayload<T>(accessToken: string): Promise<T | null> {
    const payload = await this.client.get(this.getAccessTokenKey(accessToken));

    if (!payload) {
      return null;
    }

    return JSON.parse(payload) as T;
  }

  async deleteAccessToken(accessToken: string): Promise<void> {
    await this.client.del(this.getAccessTokenKey(accessToken));
  }

  async deleteAccessTokenByUserId(userId: string): Promise<void> {
    const accessToken = await this.client.get(this.getUserAccessTokenKey(userId));

    if (accessToken) {
      await this.deleteAccessToken(accessToken);
    }

    await this.client.del(this.getUserAccessTokenKey(userId));
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

  private getAccessTokenKey(accessToken: string): string {
    return `auth:access-token:${this.hashToken(accessToken)}`;
  }

  private getUserAccessTokenKey(userId: string): string {
    return `auth:user-access-token:${userId}`;
  }

  private getPayloadUserId(payload: unknown): string | null {
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'id' in payload &&
      typeof payload.id === 'string'
    ) {
      return payload.id;
    }

    return null;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getNumberConfig(key: string): number | undefined {
    const value = this.config.get<string | number>(key);
    const parsedValue =
      typeof value === 'number' ? value : Number.parseInt(value ?? '', 10);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }
}
