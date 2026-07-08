import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../../modules/auth/auth.repo';
import { createHash } from 'crypto';

@Injectable()
export class RefreshTokenGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const args = ctx.getArgs<{ refreshToken?: string }>();

    const token = this.extractToken(req, args);
    if (!token) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const tokenHash = createHash('sha256').update(token).digest('hex');
      const storedToken =
        await this.authRepository.findActiveByRefreshTokenHash(tokenHash);

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token is revoked or expired');
      }

      req.user = { ...payload, refreshToken: token };
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return true;
  }

  private extractToken(
    req: { headers?: Record<string, string>; body?: Record<string, any> },
    args?: { refreshToken?: string },
  ): string | undefined {
    const authHeader = req?.headers?.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type?.toLowerCase() === 'bearer') return token;
    }

    return (
      args?.refreshToken ??
      req?.body?.refreshToken ??
      req?.body?.variables?.refreshToken
    );
  }
}
