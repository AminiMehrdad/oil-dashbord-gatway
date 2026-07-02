import { INestApplication } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import request from "supertest";
import { DataResolver } from "../src/resolvers/data.resolver";
import { ProductionPageResolver } from "../src/resolvers/productionPage.resolver";
import { AuthResolver } from "../src/resolvers/auth.resolver";
import { WellPageResolver } from "../src/resolvers/wellsPage.resolver";
import { WellService } from "../src/services/data.service";
import { ProductionService } from "../src/services/production.service";
import { AuthService } from "../src/services/auth.service";

describe("GraphQL API (e2e)", () => {
  let app: INestApplication;

  const wellService = {
    getWellData: jest.fn(),
    getDate: jest.fn(),
    getLatestData: jest.fn(),
    getLatest30day: jest.fn(),
    getLast30dayName: jest.fn(),
    getWellsData: jest.fn(),
    getWellPage: jest.fn(),
  };
  const productionService = {
    getGridSummery: jest.fn(),
    getProductionChart: jest.fn(),
    getFildCompare: jest.fn(),
  };
  const authService = {
    createUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), "test/schema.gql"),
          sortSchema: true,
        }),
      ],
      providers: [
        DataResolver,
        ProductionPageResolver,
        AuthResolver,
        WellPageResolver,
        { provide: WellService, useValue: wellService },
        { provide: ProductionService, useValue: productionService },
        { provide: AuthService, useValue: authService },
        { provide: APP_GUARD, useValue: { canActivate: () => true } },
        { provide: APP_INTERCEPTOR, useValue: { intercept: (_context, next) => next.handle() } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const graphql = (query: string, variables?: Record<string, unknown>) =>
    request(app.getHttpServer()).post("/graphql").send({ query, variables });

  it("runs login mutation", async () => {
    authService.login.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      statusCode: 200,
      message: "Login successful",
      user: { email: "mehrdad@example.com", role: "admin" },
    });

    const response = await graphql(
      `
        mutation Login($input: LoginInput!) {
          login(loginInput: $input) {
            accessToken
            refreshToken
            statusCode
            message
            user { email role }
          }
        }
      `,
      { input: { emailOrPhone: "mehrdad@example.com", password: "secret" } },
    ).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.login.accessToken).toBe("access-token");
    expect(authService.login).toHaveBeenCalledWith({
      emailOrPhone: "mehrdad@example.com",
      password: "secret",
    });
  });

  it("runs createUser mutation", async () => {
    authService.createUser.mockResolvedValue({ statusCode: 201, message: "User created" });

    const response = await graphql(
      `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(createUserInput: $input) {
            statusCode
            message
          }
        }
      `,
      {
        input: {
          firstName: "Mehrdad",
          lastName: "Ahmadi",
          email: "mehrdad@example.com",
          phone: "+989120000000",
          company: "Oil Co",
          password: "StrongPass123!",
        },
      },
    ).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createUser.statusCode).toBe(201);
  });

  it("runs logout mutation", async () => {
    authService.logout.mockResolvedValue({ statusCode: 200, message: "Logout successful" });

    const response = await graphql(
      `
        mutation Logout($refresh: String!) {
          logout(refresh: $refresh) {
            statusCode
            message
          }
        }
      `,
      { refresh: "refresh-token" },
    ).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.logout.message).toBe("Logout successful");
    expect(authService.logout).toHaveBeenCalledWith("refresh-token");
  });

  it("runs getLatestData query", async () => {
    wellService.getLatestData.mockResolvedValue({
      cost: 1000,
      pressure: 250,
      temperature: 75,
      production: 900,
    });

    const response = await graphql(`
      query {
        getLatestData {
          cost
          pressure
          temperature
          production
        }
      }
    `).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getLatestData.production).toBe(900);
  });

  it("runs getWellData query with id", async () => {
    wellService.getWellData.mockResolvedValue([{ id: 1, well_name: "Well A", oil: 120 }]);

    const response = await graphql(
      `
        query WellData($id: Int!) {
          getWellData(id: $id) {
            id
            well_name
            oil
          }
        }
      `,
      { id: 1 },
    ).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getWellData[0].well_name).toBe("Well A");
  });

  it("runs production page queries", async () => {
    productionService.getGridSummery.mockResolvedValue([
      { label: "Oil", value: "1200", change: "+5%", isPositive: true },
    ]);
    productionService.getProductionChart.mockResolvedValue({
      labels: ["Jan"],
      datasets: [{ label: "Oil", data: [100], backgroundColor: "#0ea5e9" }],
    });
    productionService.getFildCompare.mockResolvedValue([
      { name: "Field A", production: "1000", wells: "8", utilize: "91%" },
    ]);

    const response = await graphql(
      `
        query Production($history: String!) {
          getSummeryGrid(history: $history) { label value change isPositive }
          getProductionChart(history: $history) {
            labels
            datasets { label data backgroundColor }
          }
          getFildCompare(history: $history) { name production wells utilize }
        }
      `,
      { history: "30d" },
    ).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getSummeryGrid[0].label).toBe("Oil");
    expect(response.body.data.getProductionChart.labels).toEqual(["Jan"]);
    expect(response.body.data.getFildCompare[0].name).toBe("Field A");
  });
});
