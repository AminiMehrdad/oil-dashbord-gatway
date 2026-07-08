import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AuthUser } from './user.output';

@ObjectType()
export class LoginOutput {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => AuthUser)
  user: AuthUser;

  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;
}
