import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class UserNotFoundException extends AppException {
  constructor() {
    super(
      'User not found.',
      HttpStatus.NOT_FOUND,
      'User Not Found',
    );
  }
}