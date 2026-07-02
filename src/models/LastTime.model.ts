import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class LastTime {
    @Field(() => String)
    date: string
}