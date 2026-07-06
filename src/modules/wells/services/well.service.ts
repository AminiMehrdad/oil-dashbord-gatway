import { Injectable } from '@nestjs/common';
import { RabbitMQService } from 'src/shared/rabbit/rabbitmq.service';
import { WellProduction } from '../types/all-wells.model';
import { last30DayName } from '../types/last-30-day-name.model';
import { LastTime } from '../types/last-time.model';
import { Latest30Day } from '../types/latest-30-day.model';
import { LatestData } from '../types/latest-data.model';
import { WellData } from '../types/well-data.model';
import { WellPage } from '../types/well-page/well-page.model';

@Injectable()
export class WellService {
  constructor(private readonly rmq: RabbitMQService) {}

  async getWellData(id: number): Promise<WellData[]> {
    return this.rmq.requestJson<WellData[]>('data.id', { id }, 10_000);
  }

  async getDate(): Promise<LastTime> {
    return this.rmq.requestJson<LastTime>('data.time', {}, 10_000);
  }

  async getLatestData(): Promise<LatestData> {
    return this.rmq.requestJson<LatestData>('data.latest', {}, 10_000);
  }

  async getLatest30day(): Promise<Latest30Day> {
    return this.rmq.requestJson<Latest30Day>('data.30latest', {}, 10_000);
  }

  async getLast30dayName(): Promise<last30DayName> {
    return this.rmq.requestJson<last30DayName>('data.30lastbyname', {}, 10_000);
  }

  async getWellsData(): Promise<WellProduction> {
    return this.rmq.requestJson<WellProduction>('data.allwells', {}, 10_000);
  }

  async getWellPage(): Promise<WellPage[]> {
    return this.rmq.requestJson<WellPage[]>('data.wellpage', {}, 10_000);
  }
}
