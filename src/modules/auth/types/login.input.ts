import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field({
    description: 'Email address or phone number used to sign in.',
  })
  emailOrPhone: string;

  @Field()
  password: string;
}
