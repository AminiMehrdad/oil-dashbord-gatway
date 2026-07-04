import { RabbitMQService } from 'src/modules/realtime/services/rabbitmq.service';
import { AuthService } from '../services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let rmq: jest.Mocked<Pick<RabbitMQService, 'requestJson'>>;

  beforeEach(() => {
    rmq = { requestJson: jest.fn() };
    service = new AuthService(rmq as RabbitMQService);
  });

  it('sends create user payload to auth.createUser', async () => {
    const input = {
      firstName: 'Mehrdad',
      lastName: 'Ahmadi',
      email: 'mehrdad@example.com',
      phone: '+989120000000',
      company: 'Oil Co',
      password: 'StrongPass123!',
    };
    rmq.requestJson.mockResolvedValue({ statusCode: 201, message: 'Created' });

    await service.createUser(input);

    expect(rmq.requestJson).toHaveBeenCalledWith(
      'auth.createUser',
      input,
      10_000,
    );
  });

  it('maps login input to backend username payload', async () => {
    rmq.requestJson.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    await service.login({
      emailOrPhone: 'mehrdad@example.com',
      password: 'secret',
    });

    expect(rmq.requestJson).toHaveBeenCalledWith(
      'auth.login',
      { username: 'mehrdad@example.com', password: 'secret' },
      10_000,
    );
  });

  it('sends logout refresh token to auth.logout', async () => {
    rmq.requestJson.mockResolvedValue({
      statusCode: 200,
      message: 'Logged out',
    });

    await service.logout('refresh-token');

    expect(rmq.requestJson).toHaveBeenCalledWith(
      'auth.logout',
      { refresh: 'refresh-token' },
      10_000,
    );
  });
});
