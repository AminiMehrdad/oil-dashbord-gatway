import { Args, Query, Resolver } from '@nestjs/graphql';
import { FildCompear } from '../types/fildCompear.model';
import { ProductionChart } from '../types/productionChard.model';
import { SummeryGrid } from '../types/summeryGrid.model';
import { ProductionService } from '../services/production.service';

@Resolver()
export class ProductionPageResolver {
  constructor(private productionService: ProductionService) {}

  @Query(() => [SummeryGrid])
  async getSummeryGrid(
    @Args('history', { type: () => String }) history: string,
  ): Promise<SummeryGrid[]> {
    const answer = await this.productionService.getGridSummery(history);
    return answer;
  }

  @Query(() => ProductionChart)
  async getProductionChart(
    @Args('history', { type: () => String }) history: string,
  ): Promise<ProductionChart> {
    const answer = await this.productionService.getProductionChart(history);
    return answer;
  }

  @Query(() => [FildCompear])
  async getFildCompare(
    @Args('history', { type: () => String }) history: string,
  ): Promise<FildCompear[]> {
    const answer = await this.productionService.getFildCompare(history);
    return answer;
  }
}
