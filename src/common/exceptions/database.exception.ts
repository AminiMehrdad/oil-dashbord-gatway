import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class DatabaseException extends AppException {
  constructor() {
    super(
      'An unexpected database error occurred.',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Database Error',
    );
  }
}