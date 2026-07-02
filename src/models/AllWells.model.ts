import { ObjectType, Field, Float } from "@nestjs/graphql";

@ObjectType()
export class WellProduction {
  
  @Field(() => String)
  well_id: string;

  @Field(() => String)
  location: string;

  @Field(() => String)
  satatus: string;

  @Field(() => Float, { nullable: true })
  production: number;

  @Field(() => Float, { nullable: true })
  pressure?: number;
}