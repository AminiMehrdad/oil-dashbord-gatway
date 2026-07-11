import { Field, ObjectType } from '@nestjs/graphql';
import { UserRole } from '../../users/schemas/user.schema';

@ObjectType()
export class AuthUser {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field(() => UserRole)
  role?: UserRole;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  imageLink?: string;
}
