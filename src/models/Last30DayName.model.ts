import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class last30DayName {

  @Field(() => [String])
  well_name: string[];

  @Field(() => [Float])
  production: number[];

}