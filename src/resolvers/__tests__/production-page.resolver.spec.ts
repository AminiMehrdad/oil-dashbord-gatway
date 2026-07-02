import { ProductionPageResolver } from "../productionPage.resolver";
import { ProductionService } from "src/services/production.service";

describe("ProductionPageResolver", () => {
  let resolver: ProductionPageResolver;
  let productionService: jest.Mocked<
    Pick<ProductionService, "getGridSummery" | "getProductionChart" | "getFildCompare">
  >;

  beforeEach(() => {
    productionService = {
      getGridSummery: jest.fn(),
      getProductionChart: jest.fn(),
      getFildCompare: jest.fn(),
    };

    resolver = new ProductionPageResolver(productionService as ProductionService);
  });

  it("returns summary grid for requested history", async () => {
    const result = [{ label: "Oil", value: "1200", change: "+5%", isPositive: true }];
    productionService.getGridSummery.mockResolvedValue(result);

    await expect(resolver.getSummeryGrid("30d")).resolves.toEqual(result);
    expect(productionService.getGridSummery).toHaveBeenCalledWith("30d");
  });

  it("returns production chart for requested history", async () => {
    const result = {
      labels: ["Jan", "Feb"],
      datasets: [{ label: "Oil", data: [100, 120], backgroundColor: "#0ea5e9" }],
    };
    productionService.getProductionChart.mockResolvedValue(result);

    await expect(resolver.getProductionChart("monthly")).resolves.toEqual(result);
  });

  it("returns field comparison for requested history", async () => {
    const result = [{ name: "Field A", production: "1000", wells: "8", utilize: "91%" }];
    productionService.getFildCompare.mockResolvedValue(result);

    await expect(resolver.getFildCompare("yearly")).resolves.toEqual(result);
  });
});
