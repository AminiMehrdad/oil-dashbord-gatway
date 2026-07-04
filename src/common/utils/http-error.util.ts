import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

type ServiceResponse = {
  statusCode?: number;
  message?: string;
};

export function throwIfErrorResponse(response: ServiceResponse): void {
  const statusCode = response?.statusCode;

  if (!statusCode || statusCode < 400) {
    return;
  }

  const message = response.message ?? 'Unexpected error';

  switch (statusCode) {
    case 401:
      throw new UnauthorizedException(message);
    case 404:
      throw new NotFoundException(message);
    case 409:
      throw new ConflictException(message);
    case 500:
      throw new InternalServerErrorException(message);
    default:
      throw new BadRequestException(message);
  }
}

export function normalizeServiceError(error: unknown): never {
  if (error instanceof HttpException) {
    throw error;
  }

  throw new InternalServerErrorException('Unexpected internal error');
}
