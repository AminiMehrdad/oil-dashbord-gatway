import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { join } from 'path';
import request from 'supertest';
import { AuthResolver } from '../src/modules/auth/resolvers/auth.resolver';
import { AuthService } from '../src/modules/auth/services/auth.service';
import { ProductionPageResolver } from '../src/modules/production/resolvers/production-page.resolver';
import { ProductionService } from '../src/modules/production/services/production.service';
import { DataResolver } from '../src/modules/wells/resolvers/data.resolver';
import { WellPageResolver } from '../src/modules/wells/resolvers/wells-page.resolver';
import { WellService } from '../src/modules/wells/services/well.service';

jest.setTimeout(30_000);

type GraphQLBody<TData> = {
  errors?: unknown;
  data: TData;
};

function graphQLBody<TData>(response: unknown): GraphQLBody<TData> {
  return (response as { body: GraphQLBody<TData> }).body;
}

describe('GraphQL API (e2e)', () => {
  let app: NestFastifyApplication;

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
          autoSchemaFile: join(process.cwd(), 'test/schema.gql'),
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
        {
          provide: APP_INTERCEPTOR,
          useValue: {
            intercept: (
              _context: unknown,
              next: { handle: () => unknown },
            ): unknown => next.handle(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const graphql = (query: string, variables?: Record<string, unknown>) =>
    request(app.getHttpServer()).post('/graphql').send({ query, variables });

  it('runs login mutation', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      statusCode: 200,
      message: 'Login successful',
      user: { email: 'mehrdad@example.com', role: 'admin' },
    });

    const response = await graphql(
      `
        mutation Login($input: LoginInput!) {
          login(loginInput: $input) {
            accessToken
            refreshToken
            statusCode
            message
            user {
              email
              role
            }
          }
        }
      `,
      { input: { emailOrPhone: 'mehrdad@example.com', password: 'secret' } },
    ).expect(200);

    const body = graphQLBody<{
      login: {
        accessToken: string;
      };
    }>(response);

    expect(body.errors).toBeUndefined();
    expect(body.data.login.accessToken).toBe('access-token');
    expect(authService.login).toHaveBeenCalledWith({
      emailOrPhone: 'mehrdad@example.com',
      password: 'secret',
    });
  });

  it('runs createUser mutation', async () => {
    authService.createUser.mockResolvedValue({
      statusCode: 201,
      message: 'User created',
    });

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
          firstName: 'Mehrdad',
          lastName: 'Ahmadi',
          email: 'mehrdad@example.com',
          phone: '+989120000000',
          company: 'Oil Co',
          password: 'StrongPass123!',
        },
      },
    ).expect(200);

    const body = graphQLBody<{
      createUser: {
        statusCode: number;
      };
    }>(response);

    expect(body.errors).toBeUndefined();
    expect(body.data.createUser.statusCode).toBe(201);
  });

  it('runs logout mutation', async () => {
    authService.logout.mockResolvedValue({
      statusCode: 200,
      message: 'Logout successful',
    });

    const response = await graphql(
      `
        mutation Logout($refresh: String!) {
          logout(refresh: $refresh) {
            statusCode
            message
          }
        }
      `,
      { refresh: 'refresh-token' },
    ).expect(200);

    const body = graphQLBody<{
      logout: {
        message: string;
      };
    }>(response);

    expect(body.errors).toBeUndefined();
    expect(body.data.logout.message).toBe('Logout successful');
    expect(authService.logout).toHaveBeenCalledWith('refresh-token');
  });

  it('runs getLatestData query', async () => {
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

    const body = graphQLBody<{
      getLatestData: {
        production: number;
      };
    }>(response);

    expect(body.errors).toBeUndefined();
    expect(body.data.getLatestData.production).toBe(900);
  });

  it('runs getWellData query with id', async () => {
    wellService.getWellData.mockResolvedValue([
      { id: 1, well_name: 'Well A', oil: 120 },
    ]);

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

    const body = graphQLBody<{
      getWellData: Array<{
        well_name: string;
      }>;
    }>(response);

    expect(body.errors).toBeUndefined();
    expect(body.data.getWellData[0].well_name).toBe('Well A');
  });

  it('runs production page queries', async () => {
    productionService.getGridSummery.mockResolvedValue([
      { label: 'Oil', value: '1200', change: '+5%', isPositive: true },
    ]);
    productionService.getProductionChart.mockResolvedValue({
      labels: ['Jan'],
      datasets: [{ label: 'Oil', data: [100], backgroundColor: '#0ea5e9' }],
    });
    productionService.getFildCompare.mockResolvedValue([
      { name: 'Field A', production: '1000', wells: '8', utilize: '91%' },
    ]);

    const response = await graphql(
      `
        query Production($history: String!) {
          getSummeryGrid(history: $history) {
            label
            value
            change
            isPositive
          }
          getProductionChart(history: $history) {
            labels
            datasets {
              label
              data
              backgroundColor
            }
          }
          getFildCompare(history: $history) {
            name
            production
            wells
            utilize
          }
        }
      `,
      { history: '30d' },
    ).expect(200);

    const body = graphQLBody<{
      getSummeryGrid: Array<{
        label: string;
      }>;
      getProductionChart: {
        labels: string[];
      };
      getFildCompare: Array<{
        name: string;
      }>;
    }>(response);

    expect(body.errors).toBeUndefined();
    expect(body.data.getSummeryGrid[0].label).toBe('Oil');
    expect(body.data.getProductionChart.labels).toEqual(['Jan']);
    expect(body.data.getFildCompare[0].name).toBe('Field A');
  });
});
