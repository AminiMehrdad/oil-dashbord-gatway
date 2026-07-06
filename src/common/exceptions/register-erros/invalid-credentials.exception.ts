import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class InvalidCredentialsException extends AppException {
  constructor() {
    super(
      'Invalid email or password.',
      HttpStatus.UNAUTHORIZED,
      'Invalid Credentials',
    );
  }
}