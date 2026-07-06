import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAuthInput {
  @Field()
  userId: string;

  @Field()
  refreshTokenHash: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  revoked?: boolean;
}