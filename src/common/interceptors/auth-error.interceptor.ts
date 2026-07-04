import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class AuthErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    GqlExecutionContext.create(context);

    return next.handle().pipe(
      catchError((error: unknown) => {
        if (error instanceof UnauthorizedException) {
          return throwError(
            () =>
              new UnauthorizedException({
                success: false,
                message: error.message,
                code: 'UNAUTHORIZED',
              }),
          );
        }

        return throwError(() => error);
      }),
    );
  }
}
