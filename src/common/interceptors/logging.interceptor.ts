import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GraphQL');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const args = gqlContext.getArgs();
    const ctx = gqlContext.getContext();

    const operationType = info?.operation?.operation; // query | mutation | subscription
    const fieldName = info?.fieldName;
    const userId = ctx?.req?.user?.sub ?? 'anonymous';

    const now = Date.now();

    this.logger.log(
      `➡️  [${operationType?.toUpperCase()}] ${fieldName} | user=${userId} | args=${JSON.stringify(
        this.sanitize(args),
      )}`,
    );

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `⬅️  [${operationType?.toUpperCase()}] ${fieldName} | ${responseTime}ms | response=${JSON.stringify(
            this.sanitize(data),
          )}`,
        );
      }),
      catchError((err) => {
        const responseTime = Date.now() - now;
        this.logger.error(
          `❌ [${operationType?.toUpperCase()}] ${fieldName} | ${responseTime}ms | error=${err.message}`,
        );
        return throwError(() => err);
      }),
    );
  }

  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const clone = JSON.parse(JSON.stringify(data));
    const sensitiveKeys = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
    ];

    const recurse = (obj: any) => {
      if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          if (sensitiveKeys.includes(key)) {
            obj[key] = '***REDACTED***';
          } else if (typeof obj[key] === 'object') {
            recurse(obj[key]);
          }
        }
      }
    };
    recurse(clone);
    return clone;
  }
}
