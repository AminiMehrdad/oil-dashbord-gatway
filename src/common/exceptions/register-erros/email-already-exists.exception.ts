import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class EmailAlreadyExistsException extends AppException {
  constructor(email: string) {
    super(
      `The email '${email}' is already registered.`,
      HttpStatus.CONFLICT,
      'Email Already Exists',
    );
  }
}