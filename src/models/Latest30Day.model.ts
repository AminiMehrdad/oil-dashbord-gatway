import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Latest30Day {

  @Field(() => [String])
  dates: string[];

  @Field(() => [Float])
  production: number[];

}