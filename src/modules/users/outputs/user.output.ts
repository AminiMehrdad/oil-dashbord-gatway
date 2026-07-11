import { Field, ID, ObjectType } from '@nestjs/graphql';
import { JobRole, UserRole } from '../schemas/user.schema';

@ObjectType('User')
export class UserOutput {
  @Field(() => ID)
  _id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  company: string;

  @Field(() => JobRole)
  jobRole: JobRole;

  @Field({ nullable: true })
  imageLink?: string;

  @Field(() => UserRole)
  role?: UserRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
