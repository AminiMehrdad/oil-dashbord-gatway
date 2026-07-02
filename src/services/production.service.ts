import { Injectable } from "@nestjs/common";
import { RabbitMQService } from "./rabbitmq.service";
import { SummeryGrid } from "src/models/productionPage/summeryGrid.model";
import { ProductionChart } from "src/models/productionPage/productionChard.model";
import { FildCompear } from "src/models/productionPage/fildCompear.model";

@Injectable()
export class ProductionService {
    constructor(private readonly rmq: RabbitMQService) {};

    async getGridSummery(history: string): Promise<SummeryGrid[]> {
        return this.rmq.requestJson<SummeryGrid[]>("data.summrygrid", { history }, 10_000);
    }

    async getProductionChart(history: string): Promise <ProductionChart> {
        return this.rmq.requestJson<ProductionChart>("data.productionchart", { history }, 10_000);
    }

    async getFildCompare(history: string): Promise <FildCompear[]> {
        return this.rmq.requestJson<FildCompear[]>("data.comparion", { history }, 10_000);
    }
}
