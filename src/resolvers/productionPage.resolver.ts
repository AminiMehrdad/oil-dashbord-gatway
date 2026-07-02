import { Args, Query, Resolver, Subscription } from "@nestjs/graphql";
import { FildCompear } from "src/models/productionPage/fildCompear.model";
import { ProductionChart } from "src/models/productionPage/productionChard.model";
import { SummeryGrid } from "src/models/productionPage/summeryGrid.model";
import { ProductionService } from "src/services/production.service";
import { pubSub } from "src/services/pubsub.service";

@Resolver()
export class ProductionPageResolver {
    constructor(private productionService: ProductionService) { }

    @Query(() => [SummeryGrid])
    async getSummeryGrid(
        @Args("history", { type: () => String }) history: string
    ): Promise<SummeryGrid[]> {            
        const answer = await this.productionService.getGridSummery(history);
        return answer;
    }

    @Query(() => ProductionChart)
    async getProductionChart(
        @Args("history", { type: () => String }) history: string
    ): Promise<ProductionChart> {        
        const answer = await this.productionService.getProductionChart(history);
        return answer;
    }

    @Query(() => [FildCompear])
    async getFildCompare(
        @Args("history", { type: () => String }) history: string
    ): Promise<FildCompear[]> {        
        const answer = await this.productionService.getFildCompare(history);
        return answer;
    }

}
