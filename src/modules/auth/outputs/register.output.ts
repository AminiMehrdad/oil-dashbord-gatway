import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RegisterOutput {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;
}