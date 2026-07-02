import { Field, ObjectType } from "@nestjs/graphql";
import { ProductionDataset } from "./productionDataset.model";

@ObjectType()
export class ProductionChart {
  @Field(() => [String])
  labels: string[];

  @Field(() => [ProductionDataset])
  datasets: ProductionDataset[];
}
