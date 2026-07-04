import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class WellData {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true })
  data?: string;

  @Field({ nullable: true })
  well_name?: string;

  @Field(() => Float, { nullable: true })
  hover_open?: number;

  @Field(() => Float, { nullable: true })
  pressure_down?: number;

  @Field(() => Float, { nullable: true })
  temperature_down?: number;

  @Field(() => Float, { nullable: true })
  chock_size?: number;

  @Field(() => Float, { nullable: true })
  pressure_top?: number;

  @Field(() => Float, { nullable: true })
  temprature_top?: number;

  @Field(() => Float, { nullable: true })
  chocke_pressure?: number;

  @Field(() => Float, { nullable: true })
  oil?: number;

  @Field(() => Float, { nullable: true })
  gas?: number;

  @Field(() => Float, { nullable: true })
  water?: number;

  @Field(() => Float, { nullable: true })
  water_i?: number;

  @Field({ nullable: true })
  FLOW_KIND?: string;

  @Field(() => Int, { nullable: true })
  well_id?: number;
}
