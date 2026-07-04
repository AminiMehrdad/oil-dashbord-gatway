import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('UserProfile')
export class UserModel {
  @Field(() => ID)
  _id: string;

  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field()
  phonenumber: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  companyname?: string;

  @Field({ nullable: true })
  jobtitle?: string;

  @Field({ nullable: true })
  imageLink?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
