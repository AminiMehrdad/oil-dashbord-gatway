import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type InterceptorResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
};

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, InterceptorResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<InterceptorResponse<T>> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();

    return next.handle().pipe(
      map(
        (data): InterceptorResponse<T> => ({
          success: true,
          statusCode: 200,
          message: 'Request successful',
          data,
          timestamp: new Date().toISOString(),
          path: info?.fieldName,
        }),
      ),
    );
  }
}