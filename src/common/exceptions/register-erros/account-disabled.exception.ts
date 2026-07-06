import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class AccountDisabledException extends AppException {
  constructor() {
    super(
      'Your account has been disabled.',
      HttpStatus.FORBIDDEN,
      'Account Disabled',
    );
  }
}