import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  ferstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  createdAt?: string;
}
