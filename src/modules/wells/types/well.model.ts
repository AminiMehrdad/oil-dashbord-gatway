import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class WellData {
  @Field(() => Int)
  id: number;

  @Field()
  well_name: string;

  @Field(() => Float)
  lng: number;

  @Field(() => Float)
  lat: number;

  @Field(() => Int)
  drilingcost: number;

  @Field()
  createdAt: string;
}
