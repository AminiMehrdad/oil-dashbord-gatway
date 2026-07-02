import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

type JwtPayload = {
  exp?: number;
  role?: string;
  roles?: string[];
  tokenType?: string;
  type?: string;
  typ?: string;
  purpose?: string;
  [key: string]: unknown;
};

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    try {
      const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();
    
    // Handle both Express and Fastify request objects
    const request = ctx.req || ctx.request;
    
    if (!request) {
      throw new UnauthorizedException('Request object not found.');
    }
    
    const authHeader = request.headers?.authorization || request.headers?.Authorization;
    
    console.log('Auth Header:', authHeader);

    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException('Access token is required.');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      throw new UnauthorizedException('Access token is required.');
    }

    const payload = this.decodeJwtPayload(token);
    this.ensureAccessToken(payload);
    this.validateExpiry(payload);

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles?.length) {
      const userRoles = this.extractRoles(payload);
      const hasRole = requiredRoles.some((requiredRole) => userRoles.includes(requiredRole));

      if (!hasRole) {
        throw new ForbiddenException('You do not have access to this endpoint.');
      }
    }
    
    return true;
    } catch (error) {
      // Ensure errors are properly thrown and not swallowed
      console.error('Guard error:', error);
      throw error;
    }
  }

  private decodeJwtPayload(token: string): JwtPayload {
    const segments = token.split('.');
    
    if (segments.length !== 3) {
      throw new UnauthorizedException('Invalid access token.');
    }

    try {
      const normalized = segments[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const json = Buffer.from(padded, 'base64').toString('utf8');
      return JSON.parse(json) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid access token payload.');
    }
  }

  private validateExpiry(payload: JwtPayload): void {
    if (typeof payload.exp !== 'number') {
      throw new UnauthorizedException('Access token expiration is missing.');
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowInSeconds) {
      throw new UnauthorizedException(
        'Access token is expired. Please send refresh token to get a new access token.',
      );
    }
  }

  private ensureAccessToken(payload: JwtPayload): void {
    const tokenKind = [payload.tokenType, payload.type, payload.typ, payload.purpose]
      .find((value): value is string => typeof value === 'string')
      ?.toLowerCase();

    if (tokenKind && tokenKind.includes('refresh')) {
      throw new UnauthorizedException('Refresh token is not allowed. Access token is required.');
    }
  }

  private extractRoles(payload: JwtPayload): string[] {
    if (Array.isArray(payload.roles)) {
      return payload.roles.filter((role): role is string => typeof role === 'string');
    }

    if (typeof payload.role === 'string') {
      return [payload.role];
    }

    return [];
  }
}
