import { Resolver, Query } from "@nestjs/graphql";
import { WellPage } from "src/models/wellPage/WellPage.model";
import { WellService } from "src/services/data.service";

@Resolver()
export class WellPageResolver {
    constructor(private wellService: WellService) {}

    @Query(() => [WellPage], {nullable: true})
    async getWellPage() :Promise<WellPage[]> {
        
        const answer = await this.wellService.getWellPage();
        return answer

    }
}