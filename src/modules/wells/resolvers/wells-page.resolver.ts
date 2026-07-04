import { Resolver, Query } from '@nestjs/graphql';
import { WellPage } from '../types/well-page/well-page.model';
import { WellService } from '../services/well.service';

@Resolver()
export class WellPageResolver {
  constructor(private wellService: WellService) {}

  @Query(() => [WellPage], { nullable: true })
  async getWellPage(): Promise<WellPage[]> {
    const answer = await this.wellService.getWellPage();
    return answer;
  }
}
