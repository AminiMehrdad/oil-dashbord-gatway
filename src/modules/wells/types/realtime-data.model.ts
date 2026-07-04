import { Field, ObjectType } from '@nestjs/graphql';
import { WellProduction } from './all-wells.model';
import { last30DayName } from './last-30-day-name.model';
import { LastTime } from './last-time.model';
import { Latest30Day } from './latest-30-day.model';
import { LatestData } from './latest-data.model';
import { WellPage } from './well-page/well-page.model';
@ObjectType()
export class RealtimePayload {
  @Field(() => LatestData)
  latest: LatestData;

  @Field(() => Latest30Day)
  latest30: Latest30Day;

  @Field(() => last30DayName)
  latest30name: last30DayName;

  @Field(() => [WellProduction])
  allwells: WellProduction[];

  @Field(() => LastTime)
  date: LastTime;

  @Field(() => [WellPage])
  wellPage: WellPage[];
}
