import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class LatestData {
    @Field(() => Float)
    cost: number

    @Field(() => Float)
    pressure: number

    @Field(() => Float)
    temperature: number

    @Field(() => Float)
    production: number
}