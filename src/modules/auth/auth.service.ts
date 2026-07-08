import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';
import { InvalidCredentialsException } from '../../common/exceptions/custom.exception';
import { RedisService } from 'src/shared/redis/redis.service';
import { UsersRepository } from '../users/users.repo';
import { UserOutput } from '../users/outputs/user.output';
import { UsersService } from '../users/users.service';
import { RegisterInput } from './inputs/register.input';
import { AuthRepository } from './auth.repo';
import { AuthPayload } from './types/auth-payload.model';
import { LoginInput } from './types/login.input';
import { LogOutUser } from './types/logout-user.output';

const scryptAsync = promisify(scrypt);

type JwtUserPayload = {
  sub?: string;
  id?: string;
  email?: string;
  role?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async register(registerInput: RegisterInput): Promise<UserOutput> {
    const hashedPassword = await this.hashPassword(registerInput.password);

    return this.userService.create({
      ...registerInput,
      password: hashedPassword,
    });
  }

  async login(loginInput: LoginInput): Promise<AuthPayload> {
    const user = await this.findUserByEmailOrPhone(loginInput.emailOrPhone);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.comparePassword(
      loginInput.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const userId = user._id.toString();
    const accessToken = this.signToken(
      {
        sub: userId,
        id: userId,
        email: user.email,
        role: user.role,
      },
      this.getAccessTokenSecret(),
      this.getAccessTokenTtlSeconds(),
    );
    const refreshToken = this.signToken(
      {
        sub: userId,
        id: userId,
        type: 'refresh',
      },
      this.getRefreshTokenSecret(),
      this.getRefreshTokenTtlSeconds(),
    );

    await this.redis.setAccessToken(
      accessToken,
      {
        id: userId,
        email: user.email,
        role: user.role,
      },
      this.getAccessTokenTtlSeconds(),
    );
    await this.authRepository.upsertActiveToken({
      userId,
      refreshTokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + this.getRefreshTokenTtlSeconds() * 1000),
      revoked: false,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user.email,
        role: user.role,
        ferstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt?.toISOString(),
      },
      statusCode: 200,
      message: 'Login successful',
    };
  }

  async logout(refreshToken: string): Promise<LogOutUser> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshTokenHash = this.hashToken(refreshToken);
    const storedToken = await this.authRepository.findActiveByRefreshTokenHash(
      refreshTokenHash,
    );

    if (storedToken?.userId) {
      await this.authRepository.revokeByUserId(storedToken.userId);
      await this.redis.deleteRefreshToken(storedToken.userId);
      await this.redis.deleteAccessTokenByUserId(storedToken.userId);
    }

    return {
      statusCode: 200,
      message: 'Logout successful',
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthPayload> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshTokenHash = this.hashToken(refreshToken);
    const storedToken = await this.authRepository.findActiveByRefreshTokenHash(
      refreshTokenHash,
    );

    if (!storedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload = this.verifyToken<JwtUserPayload>(
      refreshToken,
      this.getRefreshTokenSecret(),
    );
    const userId = payload.sub ?? payload.id;

    if (!userId || userId !== storedToken.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersRepository.findById(userId);
    const newAccessToken = this.signToken(
      {
        sub: userId,
        id: userId,
        email: user.email,
        role: user.role,
      },
      this.getAccessTokenSecret(),
      this.getAccessTokenTtlSeconds(),
    );
    const newRefreshToken = this.signToken(
      {
        sub: userId,
        id: userId,
        type: 'refresh',
      },
      this.getRefreshTokenSecret(),
      this.getRefreshTokenTtlSeconds(),
    );

    await this.authRepository.revokeByUserId(userId);
    await this.authRepository.upsertActiveToken({
      userId,
      refreshTokenHash: this.hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + this.getRefreshTokenTtlSeconds() * 1000),
      revoked: false,
    });
    await this.redis.deleteAccessTokenByUserId(userId);
    await this.redis.setAccessToken(
      newAccessToken,
      {
        id: userId,
        email: user.email,
        role: user.role,
      },
      this.getAccessTokenTtlSeconds(),
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: userId,
        email: user.email,
        role: user.role,
        ferstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt?.toISOString(),
      },
      statusCode: 200,
      message: 'Token refreshed successfully',
    };
  }

  private async findUserByEmailOrPhone(identifier: string) {
    const normalizedIdentifier = identifier.trim();
    const byEmail = await this.usersRepository.findByEmail(
      normalizedIdentifier,
      true,
    );

    if (byEmail) {
      return byEmail;
    }

    return this.usersRepository.findByPhone(normalizedIdentifier);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64);

    return `${salt}:${(derivedKey as Buffer).toString('hex')}`;
  }

  private async comparePassword(
    password: string,
    storedHash: string,
  ): Promise<boolean> {
    if (!storedHash.includes(':')) {
      return storedHash === password;
    }

    const [salt, storedHashValue] = storedHash.split(':');
    const derivedKey = await scryptAsync(password, salt, 64);

    return storedHashValue === (derivedKey as Buffer).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private signToken(
    payload: Record<string, unknown>,
    secret: string,
    ttlSeconds: number,
  ): string {
    return jwt.sign(payload, secret, { expiresIn: ttlSeconds });
  }

  private verifyToken<T>(token: string, secret: string): T {
    try {
      return jwt.verify(token, secret) as T;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private getAccessTokenSecret(): string {
    return this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret';
  }

  private getRefreshTokenSecret(): string {
    return this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret';
  }

  private getAccessTokenTtlSeconds(): number {
    return this.getNumberConfig('ACCESS_TOKEN_TTL_SECONDS', 900);
  }

  private getRefreshTokenTtlSeconds(): number {
    return this.getNumberConfig(
      'REFRESH_TOKEN_TTL_SECONDS',
      7 * 24 * 60 * 60,
    );
  }

  private getNumberConfig(key: string, fallback: number): number {
    const value = this.config.get<string | number>(key);
    const parsedValue =
      typeof value === 'number' ? value : Number.parseInt(value ?? '', 10);

    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }
}
