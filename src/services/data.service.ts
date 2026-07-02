import { Injectable } from "@nestjs/common";
import { WellData } from "src/models/wellData.model";
import { RabbitMQService } from "./rabbitmq.service";
import { LatestData } from "src/models/LatestData.model";
import { Latest30Day } from "src/models/Latest30Day.model";
import { last30DayName } from "src/models/Last30DayName.model";
import { WellProduction } from "src/models/AllWells.model";
import { LastTime } from "src/models/LastTime.model";
import { WellPage } from "src/models/wellPage/WellPage.model";

@Injectable()
export class WellService {
  constructor(private readonly rmq: RabbitMQService) { };

  async getWellData(id: number): Promise<WellData[]> {
    return this.rmq.requestJson<WellData[]>('data.id', { id }, 10_000);
  };

  async getDate(): Promise<LastTime> {
    return this.rmq.requestJson<LastTime>("data.time", {}, 10_000);
  }

  async getLatestData(): Promise<LatestData> {
    return this.rmq.requestJson<LatestData>("data.latest", {}, 10_000);
  };


  async getLatest30day(): Promise<Latest30Day> {
    return this.rmq.requestJson<Latest30Day>("data.30latest", {}, 10_000);
  }

  async getLast30dayName(): Promise<last30DayName> {
    return this.rmq.requestJson<last30DayName>("data.30lastbyname", {}, 10_000);
  }

  async getWellsData(): Promise<WellProduction> {
    return this.rmq.requestJson<WellProduction>("data.allwells", {}, 10_000);
  }

  async getWellPage(): Promise<WellPage[]> {
    return this.rmq.requestJson<WellPage[]>("data.wellpage", {}, 10_000);
  }
};
