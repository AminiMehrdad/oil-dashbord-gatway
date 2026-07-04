import { RabbitMQService } from 'src/modules/realtime/services/rabbitmq.service';
import { WellService } from '../services/well.service';

describe('WellService', () => {
  let service: WellService;
  let rmq: jest.Mocked<Pick<RabbitMQService, 'requestJson'>>;

  beforeEach(() => {
    rmq = { requestJson: jest.fn().mockResolvedValue({}) };
    service = new WellService(rmq as RabbitMQService);
  });

  it('sends getWellData request through RabbitMQ', async () => {
    await service.getWellData(10);

    expect(rmq.requestJson).toHaveBeenCalledWith('data.id', { id: 10 }, 10_000);
  });

  it.each([
    ['getDate', 'data.time'],
    ['getLatestData', 'data.latest'],
    ['getLatest30day', 'data.30latest'],
    ['getLast30dayName', 'data.30lastbyname'],
    ['getWellsData', 'data.allwells'],
    ['getWellPage', 'data.wellpage'],
  ] as const)(
    'sends %s request through RabbitMQ',
    async (method, routingKey) => {
      await service[method]();

      expect(rmq.requestJson).toHaveBeenCalledWith(routingKey, {}, 10_000);
    },
  );
});
