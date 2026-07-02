import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProductionDataset {
  @Field()
  label: string;

  @Field(() => [Number])
  data: number[];

  @Field()
  backgroundColor: string;
}
