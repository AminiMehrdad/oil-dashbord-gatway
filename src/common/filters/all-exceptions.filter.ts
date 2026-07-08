import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

type ErrorResponseBody = {
  message?: string | string[];
  error?: string;
  errorCode?: string;
  details?: unknown;
};

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object') {
        const res = response as ErrorResponseBody;
        const responseMessage = res.message;

        errorCode =
          res.errorCode ?? this.mapStatusToCode(statusCode);

        details = res.details;

        if (Array.isArray(responseMessage)) {
          message = responseMessage.join(', ');
          errorCode = 'VALIDATION_ERROR';
          details = responseMessage;
        } else if (typeof responseMessage === 'string') {
          message = responseMessage;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `❌ [${info?.fieldName ?? 'unknown'}] ${errorCode} (${statusCode}): ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    throw new GraphQLError(message, {
      extensions: {
        success: false,
        statusCode,
        errorCode,
        details,
        timestamp: new Date().toISOString(),
        path: info?.fieldName,
      },
    });
  }

  private mapStatusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return map[status] || 'UNKNOWN_ERROR';
  }
}
