import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteUserOutput {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
