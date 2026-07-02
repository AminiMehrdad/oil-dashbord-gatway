import { Args, Resolver, Query, Int, Subscription } from "@nestjs/graphql";
import { pubSub } from "../services/pubsub.service"
import { LatestData } from "../models/LatestData.model";
import { WellData } from "src/models/wellData.model";
import { WellService } from "../services/data.service";
import { Latest30Day } from "src/models/Latest30Day.model";
import { last30DayName } from "src/models/Last30DayName.model";
import { WellProduction } from "src/models/AllWells.model";
import { RealtimePayload } from "src/models/RealTimeData.model";
import { LastTime } from "src/models/LastTime.model";
import { Roles } from "src/auth/decorators/roles.decorator";

@Resolver()
export class DataResolver {
  constructor(private wellService: WellService) { }

  @Query(() => [WellData], { nullable: true })
  async getWellData(
    @Args("id", { type: () => Int }) id: number
  ): Promise<WellData[]> {
    const answer = await this.wellService.getWellData(id);
    return answer;
  }

  @Query(() => LastTime)
  async getDate(): Promise<LastTime> {
    const answer = await this.wellService.getDate();
    return answer
  }

  @Query(() => LatestData)
  async getLatestData(): Promise<LatestData> {
    const answer = await this.wellService.getLatestData()
    return answer
  }

  @Subscription(() => RealtimePayload, {
    name: "latestDataUpdated"
  })
  latestDataUpdated() {
    return pubSub.asyncIterator("LATEST_DATA_UPDATED");
  }

  @Query(() => Latest30Day)
  async getLatest30day(): Promise<Latest30Day> {
    const answer = await this.wellService.getLatest30day()
    return answer
  }

  @Query(() => last30DayName)
  async getLast30dayName(): Promise<last30DayName> {
    const answer = await this.wellService.getLast30dayName()
    return answer
  }

  @Query(() => [WellProduction])
  // @Roles("admin")
  async getWellsData(): Promise<WellProduction> {
    const answer = await this.wellService.getWellsData()
    return answer
  }
}
