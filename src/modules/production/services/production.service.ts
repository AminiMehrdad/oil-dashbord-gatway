import { Injectable } from '@nestjs/common';
import { RabbitMQService } from 'src/shared/rabbit/rabbitmq.service';
import { FildCompear } from '../types/fildCompear.model';
import { ProductionChart } from '../types/productionChard.model';
import { SummeryGrid } from '../types/summeryGrid.model';

@Injectable()
export class ProductionService {
  constructor(private readonly rmq: RabbitMQService) {}

  async getGridSummery(history: string): Promise<SummeryGrid[]> {
    return this.rmq.requestJson<SummeryGrid[]>(
      'data.summrygrid',
      { history },
      10_000,
    );
  }

  async getProductionChart(history: string): Promise<ProductionChart> {
    return this.rmq.requestJson<ProductionChart>(
      'data.productionchart',
      { history },
      10_000,
    );
  }

  async getFildCompare(history: string): Promise<FildCompear[]> {
    return this.rmq.requestJson<FildCompear[]>(
      'data.comparion',
      { history },
      10_000,
    );
  }
}
