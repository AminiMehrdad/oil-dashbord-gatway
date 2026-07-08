import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RedisService } from '../../shared/redis/redis.service';
import { UserRole } from '../../modules/users/schemas/user.schema';

type AccessTokenPayload = {
  sub?: string;
  id?: string;
  email?: string;
  role?: UserRole;
};

@Injectable()
export class AccessTokenGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      const cachedPayload =
        await this.redisService.getAccessTokenPayload<AccessTokenPayload>(token);

      if (!cachedPayload) {
        throw new UnauthorizedException('Access token is revoked or expired');
      }

      req.user = {
        ...cachedPayload,
        sub: payload.sub ?? payload.id ?? cachedPayload.id,
        id: payload.id ?? payload.sub ?? cachedPayload.id,
        email: payload.email ?? cachedPayload.email,
        role: payload.role ?? cachedPayload.role,
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired access token');
    }

    return true;
  }

  private extractToken(req: any): string | undefined {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
