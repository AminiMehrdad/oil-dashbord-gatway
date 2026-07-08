import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LogOutUser {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;
}
