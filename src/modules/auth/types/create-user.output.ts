import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreatedUser {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;
}
