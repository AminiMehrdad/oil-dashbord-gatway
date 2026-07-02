import { Field, Float, ObjectType } from "@nestjs/graphql";
import { LatestData } from "./LatestData.model";
import { Latest30Day } from "./Latest30Day.model";
import { last30DayName } from "./Last30DayName.model";
import { WellProduction } from "./AllWells.model";
import { LastTime } from "./LastTime.model";
import { WellPage } from "./wellPage/WellPage.model";
@ObjectType()
export class RealtimePayload {

  @Field(() => LatestData)
  latest: LatestData

  @Field(() => Latest30Day)
  latest30: Latest30Day

  @Field(() => last30DayName)
  latest30name: last30DayName

  @Field(() => [WellProduction])
  allwells: WellProduction[]

  @Field(() => LastTime)
  date: LastTime

  @Field(() => [WellPage])
  wellPage: WellPage[]
}