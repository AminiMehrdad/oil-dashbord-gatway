import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    error = 'Application Error',
  ) {
    super(
      {
        success: false,
        message,
        error,
        statusCode: status,
      },
      status,
    );
  }
}


