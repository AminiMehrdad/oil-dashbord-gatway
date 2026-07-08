import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  public readonly errorCode: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    errorCode = 'CUSTOM_ERROR',
    details?: any,
  ) {
    super(
      {
        message,
        errorCode,
        details,
      },
      statusCode,
    );
    this.errorCode = errorCode;
    this.details = details;
  }
}

// Some ready-to-use specific exceptions:
export class ResourceNotFoundException extends CustomException {
  constructor(resource = 'Resource', details?: any) {
    super(`${resource} not found`, HttpStatus.NOT_FOUND, 'RESOURCE_NOT_FOUND', details);
  }
}

export class UnauthorizedActionException extends CustomException {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, HttpStatus.FORBIDDEN, 'UNAUTHORIZED_ACTION');
  }
}

export class InvalidCredentialsException extends CustomException {
  constructor(message = 'Invalid credentials') {
    super(message, HttpStatus.UNAUTHORIZED, 'INVALID_CREDENTIALS');
  }
}


// ===================================================================
export class EmailAlreadyExistsException extends CustomException {
  constructor(email: string) {
    super(
      `Email ${email} already exists`,
      HttpStatus.CONFLICT,
      'EMAIL_ALREADY_EXISTS',
    );
  }
}

export class PhoneAlreadyExistsException extends CustomException {
  constructor(phone: string) {
    super(
      `Phone ${phone} already exists`,
      HttpStatus.CONFLICT,
      'PHONE_ALREADY_EXISTS',
    );
  }
}

export class DatabaseException extends CustomException {
  constructor(message = 'Database operation failed') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'DATABASE_ERROR');
  }
}

export class ValidationException extends CustomException {
  constructor(message = 'Validation failed', details?: any) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', details);
  }
}

export class UserNotFoundException extends CustomException {
  constructor() {
    super(
      `User not found`,
      HttpStatus.NOT_FOUND,
      'USER_NOT_FOUND',
    );
  }
}

