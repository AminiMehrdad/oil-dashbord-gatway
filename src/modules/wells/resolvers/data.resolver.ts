import { Args, Resolver, Query, Int, Subscription } from '@nestjs/graphql';
import { pubSub } from 'src/shared/rabbit/pubsub.service';
import { LatestData } from '../types/latest-data.model';
import { WellService } from '../services/well.service';
import { WellProduction } from '../types/all-wells.model';
import { last30DayName } from '../types/last-30-day-name.model';
import { LastTime } from '../types/last-time.model';
import { Latest30Day } from '../types/latest-30-day.model';
import { RealtimePayload } from '../types/realtime-data.model';
import { WellData } from '../types/well-data.model';

@Resolver()
export class DataResolver {
  constructor(private wellService: WellService) {}

  @Query(() => [WellData], { nullable: true })
  async getWellData(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<WellData[]> {
    const answer = await this.wellService.getWellData(id);
    return answer;
  }

  @Query(() => LastTime)
  async getDate(): Promise<LastTime> {
    const answer = await this.wellService.getDate();
    return answer;
  }

  @Query(() => LatestData)
  async getLatestData(): Promise<LatestData> {
    const answer = await this.wellService.getLatestData();
    return answer;
  }

  @Subscription(() => RealtimePayload, {
    name: 'latestDataUpdated',
  })
  latestDataUpdated() {
    return pubSub.asyncIterator('LATEST_DATA_UPDATED');
  }

  @Query(() => Latest30Day)
  async getLatest30day(): Promise<Latest30Day> {
    const answer = await this.wellService.getLatest30day();
    return answer;
  }

  @Query(() => last30DayName)
  async getLast30dayName(): Promise<last30DayName> {
    const answer = await this.wellService.getLast30dayName();
    return answer;
  }

  @Query(() => [WellProduction])
  // @Roles("admin")
  async getWellsData(): Promise<WellProduction> {
    const answer = await this.wellService.getWellsData();
    return answer;
  }
}
