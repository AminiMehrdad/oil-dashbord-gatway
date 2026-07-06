import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class UsernameAlreadyExistsException extends AppException {
  constructor(username: string) {
    super(
      `The username '${username}' is already taken.`,
      HttpStatus.CONFLICT,
      'Username Already Exists',
    );
  }
}