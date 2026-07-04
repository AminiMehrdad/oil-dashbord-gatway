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

type RequestHeaders = Record<string, string | string[] | undefined>;

type LoggedRequest = {
  method?: string;
  url?: string;
  body?: unknown;
  headers?: RequestHeaders;
  ip?: string;
  user?: {
    id?: string | number;
  };
};

type GraphQLLoggingContext = {
  req?: LoggedRequest;
};

type GraphQLInfo = {
  operation?: {
    operation?: string;
  };
  fieldName?: string;
  parentType?: {
    name?: string;
  };
};

type HttpResponse = {
  statusCode?: number;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getErrorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

function formatHeaderValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return value ?? 'unknown';
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
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
  ): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo<GraphQLInfo>();
    const request = gqlContext.getContext<GraphQLLoggingContext>().req;

    const operationType = info.operation?.operation ?? 'unknown';
    const operationName = info.fieldName ?? 'unknown';
    const parentType = info.parentType?.name ?? 'unknown';

    const args = gqlContext.getArgs<Record<string, unknown>>();
    const userId = request?.user?.id ?? 'anonymous';
    const ip = formatHeaderValue(
      request?.ip ?? request?.headers?.['x-forwarded-for'],
    );

    this.logger.log(
      `📥 [INCOMING GraphQL] ${operationType.toUpperCase()} ${parentType}.${operationName}`,
    );
    this.logger.debug(`   User: ${userId} | IP: ${ip}`);
    this.logger.debug(`   Args: ${JSON.stringify(args)}`);

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `📤 [OUTGOING GraphQL] ${operationType.toUpperCase()} ${parentType}.${operationName} - ${duration}ms`,
          );
          this.logger.debug(`   Response: ${JSON.stringify(data)}`);
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `❌ [ERROR GraphQL] ${operationType.toUpperCase()} ${parentType}.${operationName} - ${duration}ms`,
          );
          this.logger.error(`   Error: ${getErrorMessage(error)}`);
          this.logger.debug(`   Stack: ${getErrorStack(error)}`);
        },
      }),
    );
  }

  private handleHttpRequest(
    context: ExecutionContext,
    next: CallHandler,
    startTime: number,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<LoggedRequest>();
    const { method = 'unknown', url = 'unknown', body, headers } = request;
    const userAgent = formatHeaderValue(headers?.['user-agent']);
    const ip = formatHeaderValue(request.ip ?? headers?.['x-forwarded-for']);

    this.logger.log(`📥 [INCOMING HTTP] ${method} ${url}`);
    this.logger.debug(`   IP: ${ip} | User-Agent: ${userAgent}`);
    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      this.logger.debug(`   Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const response = context.switchToHttp().getResponse<HttpResponse>();
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode ?? 'unknown';

          this.logger.log(
            `📤 [OUTGOING HTTP] ${method} ${url} - ${statusCode} - ${duration}ms`,
          );
          this.logger.debug(
            `   Response: ${JSON.stringify(data)?.substring(0, 200)}...`,
          );
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          this.logger.error(`❌ [ERROR HTTP] ${method} ${url} - ${duration}ms`);
          this.logger.error(`   Error: ${getErrorMessage(error)}`);
          this.logger.debug(`   Stack: ${getErrorStack(error)}`);
        },
      }),
    );
  }
}
