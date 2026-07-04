import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SummeryGrid {
  @Field(() => String)
  label: string;

  @Field(() => String)
  value: string;

  @Field(() => String)
  change: string;

  @Field(() => Boolean)
  isPositive: boolean;
}
