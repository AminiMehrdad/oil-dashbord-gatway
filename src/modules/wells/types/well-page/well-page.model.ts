import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class WellPage {
  @Field(() => String)
  name: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  location: string;

  @Field(() => String, { nullable: true })
  oil: string;

  @Field(() => String, { nullable: true })
  pressure?: string;

  @Field(() => String, { nullable: true })
  temperature?: string;

  @Field(() => String, { nullable: true })
  hour?: string;
}
