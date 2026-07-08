import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AuthUser } from './auth-user.model';

@ObjectType()
export class AuthPayload {
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
