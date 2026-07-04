import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
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
}
