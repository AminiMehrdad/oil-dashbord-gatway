import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { DataResolver } from './resolvers/data.resolver';
import { WellService } from './services/data.service';
import { RabbitMQService } from './services/rabbitmq.service';
import { RealtimeService } from './services/realtime.service';
import { WellPageResolver } from './resolvers/wellsPage.resolver';
import { ProductionPageResolver } from './resolvers/productionPage.resolver';
import { ProductionService } from './services/production.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { AuthService } from './services/auth.service';
import { GqlAuthGuard } from './auth/guards/gql-auth.guard';
import { AuthErrorInterceptor } from './auth/interceptors/auth-error.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        "graphql-ws": true
      },
      context: ({ req, request, connectionParams }) => {
        const actualRequest = req || request;
        return { req: actualRequest ?? { headers: connectionParams ?? {} } };
      },
      sortSchema: true,
      playground: true,
    }),
  ],

  providers:
    [
      DataResolver,
      WellPageResolver,
      ProductionPageResolver,
      AuthResolver,

      WellService,
      RabbitMQService,
      RealtimeService,
      ProductionService,
      AuthService,
      {
        provide: APP_GUARD,
        useClass: GqlAuthGuard,
      },
      {
        provide: APP_INTERCEPTOR,
        useClass: AuthErrorInterceptor,
      },
      {
        provide: APP_INTERCEPTOR,
        useClass: LoggingInterceptor,
      },
    ],
})
export class AppModule { }
