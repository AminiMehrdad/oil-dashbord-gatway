import { RabbitMQService } from 'src/modules/realtime/services/rabbitmq.service';
import { ProductionService } from '../services/production.service';

describe('ProductionService', () => {
  let service: ProductionService;
  let rmq: jest.Mocked<Pick<RabbitMQService, 'requestJson'>>;

  beforeEach(() => {
    rmq = { requestJson: jest.fn().mockResolvedValue({}) };
    service = new ProductionService(rmq as RabbitMQService);
  });

  it.each([
    ['getGridSummery', 'data.summrygrid'],
    ['getProductionChart', 'data.productionchart'],
    ['getFildCompare', 'data.comparion'],
  ] as const)(
    'sends %s request through RabbitMQ',
    async (method, routingKey) => {
      await service[method]('30d');

      expect(rmq.requestJson).toHaveBeenCalledWith(
        routingKey,
        { history: '30d' },
        10_000,
      );
    },
  );
});
