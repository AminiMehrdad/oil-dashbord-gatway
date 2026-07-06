import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from 'src/modules/auth/decorators/public.decorator';
import { ROLES_KEY } from 'src/modules/auth/decorators/roles.decorator';
import { RedisService } from 'src/shared/redis/redis.service';

type AuthenticatedUser = {
  id: string;
  email?: string;
  role?: string;
};

type RequestWithUser = {
  headers?: Record<string, string | string[] | undefined>;
  user?: AuthenticatedUser;
};

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = this.getRequest(context);
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    const user =
      await this.redis.getAccessTokenPayload<AuthenticatedUser>(token);

    if (!user?.id) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    this.assertRoles(context, user);
    request.user = user;

    return true;
  }

  private assertRoles(
    context: ExecutionContext,
    user: AuthenticatedUser,
  ): void {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (roles?.length && (!user.role || !roles.includes(user.role))) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  private getRequest(context: ExecutionContext): RequestWithUser {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext<{ req?: RequestWithUser }>().req;

    if (!request) {
      throw new UnauthorizedException('Request context is missing');
    }

    return request;
  }

  private extractBearerToken(request: RequestWithUser): string | null {
    const header = request.headers?.authorization;
    const authorization = Array.isArray(header) ? header[0] : header;

    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');
    return type?.toLowerCase() === 'bearer' && token ? token : null;
  }
}
