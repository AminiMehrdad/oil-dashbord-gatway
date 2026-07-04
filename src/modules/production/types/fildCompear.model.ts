import { Field, ObjectType } from '@nestjs/graphql';
// import {  } from "@nestjs/graphql";

@ObjectType()
export class FildCompear {
  @Field(() => String)
  name: string;

  @Field(() => String)
  production: string;

  @Field(() => String)
  wells: string;

  @Field(() => String)
  utilize: string;
}
