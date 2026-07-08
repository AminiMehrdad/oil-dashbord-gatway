import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StandardResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: 200,
        message: 'Request successful',
        data,
        timestamp: new Date().toISOString(),
        path: info?.fieldName,
      })),
    );
  }
}