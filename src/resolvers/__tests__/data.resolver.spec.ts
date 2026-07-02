import { DataResolver } from "../data.resolver";
import { WellService } from "src/services/data.service";

describe("DataResolver", () => {
  let resolver: DataResolver;
  let wellService: jest.Mocked<
    Pick<
      WellService,
      | "getWellData"
      | "getDate"
      | "getLatestData"
      | "getLatest30day"
      | "getLast30dayName"
      | "getWellsData"
    >
  >;

  beforeEach(() => {
    wellService = {
      getWellData: jest.fn(),
      getDate: jest.fn(),
      getLatestData: jest.fn(),
      getLatest30day: jest.fn(),
      getLast30dayName: jest.fn(),
      getWellsData: jest.fn(),
    };

    resolver = new DataResolver(wellService as WellService);
  });

  it("returns well data by id", async () => {
    const result = [{ id: 1, well_name: "Well A", oil: 120 }];
    wellService.getWellData.mockResolvedValue(result);

    await expect(resolver.getWellData(1)).resolves.toEqual(result);
    expect(wellService.getWellData).toHaveBeenCalledWith(1);
  });

  it("returns dashboard latest data", async () => {
    const result = { cost: 1000, pressure: 250, temperature: 75, production: 900 };
    wellService.getLatestData.mockResolvedValue(result);

    await expect(resolver.getLatestData()).resolves.toEqual(result);
  });

  it("returns latest date", async () => {
    const result = { date: "2026-05-30T10:00:00Z" };
    wellService.getDate.mockResolvedValue(result);

    await expect(resolver.getDate()).resolves.toEqual(result);
  });
});
