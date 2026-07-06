import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class PhoneAlreadyExistsException extends AppException {
  constructor(phone: string) {
    super(
      `The phone number '${phone}' is already registered.`,
      HttpStatus.CONFLICT,
      'Phone Number Already Exists',
    );
  }
}