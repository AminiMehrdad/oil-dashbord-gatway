import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const contextType = context.getType<string>();

    if (contextType === 'graphql' || contextType.toString() === 'graphql') {
      return this.handleGraphQLRequest(context, next, now);
    } else if (contextType === 'http') {
      return this.handleHttpRequest(context, next, now);
    }

    return next.handle();
  }

  private handleGraphQLRequest(
    context: ExecutionContext,
    next: CallHandler,
    startTime: number,
  ): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const request = gqlContext.getContext().req;

    const operationType = info?.operation?.operation || 'unknown';
    const operationName = info?.fieldName || 'unknown';
    const parentType = info?.parentType?.name || 'unknown';

    const args = gqlContext.getArgs();
    const userId = request?.user?.id || 'anonymous';
    const ip = request?.ip || request?.headers?.['x-forwarded-for'] || 'unknown';

    this.logger.log(
      `📥 [INCOMING GraphQL] ${operationType.toUpperCase()} ${parentType}.${operationName}`,
    );
    this.logger.debug(`   User: ${userId} | IP: ${ip}`);
    this.logger.debug(`   Args: ${JSON.stringify(args)}`);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `📤 [OUTGOING GraphQL] ${operationType.toUpperCase()} ${parentType}.${operationName} - ${duration}ms`,
          );
          this.logger.debug(`   Response: ${JSON.stringify(data)}`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `❌ [ERROR GraphQL] ${operationType.toUpperCase()} ${parentType}.${operationName} - ${duration}ms`,
          );
          this.logger.error(`   Error: ${error.message}`);
          this.logger.debug(`   Stack: ${error.stack}`);
        },
      }),
    );
  }

  private handleHttpRequest(
    context: ExecutionContext,
    next: CallHandler,
    startTime: number,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const ip = request.ip || headers['x-forwarded-for'] || 'unknown';

    this.logger.log(`📥 [INCOMING HTTP] ${method} ${url}`);
    this.logger.debug(`   IP: ${ip} | User-Agent: ${userAgent}`);
    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`   Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.log(
            `📤 [OUTGOING HTTP] ${method} ${url} - ${statusCode} - ${duration}ms`,
          );
          this.logger.debug(`   Response: ${JSON.stringify(data)?.substring(0, 200)}...`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `❌ [ERROR HTTP] ${method} ${url} - ${duration}ms`,
          );
          this.logger.error(`   Error: ${error.message}`);
          this.logger.debug(`   Stack: ${error.stack}`);
        },
      }),
    );
  }
}
