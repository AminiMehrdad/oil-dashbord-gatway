import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthResolver } from '../resolvers/auth.resolver';
import { AuthService } from '../services/auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: jest.Mocked<
    Pick<AuthService, 'createUser' | 'login' | 'logout'>
  >;

  beforeEach(() => {
    authService = {
      createUser: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    };

    resolver = new AuthResolver(authService as AuthService);
  });

  it('creates a user', async () => {
    const input = {
      firstName: 'Mehrdad',
      lastName: 'Ahmadi',
      email: 'mehrdad@example.com',
      phone: '+989120000000',
      company: 'Oil Co',
      password: 'StrongPass123!',
      role: 'engineer',
    };
    const result = { statusCode: 201, message: 'User created' };
    authService.createUser.mockResolvedValue(result);

    await expect(resolver.createUser(input)).resolves.toEqual(result);
    expect(authService.createUser).toHaveBeenCalledWith(input);
  });

  it('logs in and returns tokens', async () => {
    const result = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { email: 'mehrdad@example.com', role: 'admin' },
      statusCode: 200,
      message: 'Login successful',
    };
    authService.login.mockResolvedValue(result);

    await expect(
      resolver.login({
        emailOrPhone: 'mehrdad@example.com',
        password: 'secret',
      }),
    ).resolves.toEqual(result);
  });

  it('throws UnauthorizedException for failed login', async () => {
    authService.login.mockResolvedValue({
      statusCode: 401,
      message: 'Unauthorized',
    });

    await expect(
      resolver.login({ emailOrPhone: 'wrong@example.com', password: 'bad' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logs out with refresh token', async () => {
    const result = { statusCode: 200, message: 'Logout successful' };
    authService.logout.mockResolvedValue(result);

    await expect(resolver.logout('refresh-token')).resolves.toEqual(result);
    expect(authService.logout).toHaveBeenCalledWith('refresh-token');
  });

  it.each([
    [400, BadRequestException],
    [401, UnauthorizedException],
    [500, InternalServerErrorException],
  ])(
    'maps logout status %s to GraphQL exception',
    async (statusCode, exception) => {
      authService.logout.mockResolvedValue({ statusCode, message: 'Error' });

      await expect(resolver.logout('refresh-token')).rejects.toBeInstanceOf(
        exception,
      );
    },
  );
});
