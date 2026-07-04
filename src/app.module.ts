import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// import { GqlAuthGuard } from './common/guards/gql-auth.guard';
import { AuthErrorInterceptor } from './common/interceptors/auth-error.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { ProductionModule } from './modules/production/production.module';
import { UsersModule } from './modules/users/users.module';
import { WellsModule } from './modules/wells/wells.module';
import { MongodbModule } from './shared/mongodb/mongodb.module';
import { RedisModule } from './shared/redis/redis.module';

type GraphQLContextRequest = {
  headers?: Record<string, unknown>;
};

type GraphQLContextFactoryInput = {
  req?: GraphQLContextRequest;
  request?: GraphQLContextRequest;
  connectionParams?: Record<string, unknown>;
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': true,
      },
      context: ({
        req,
        request,
        connectionParams,
      }: GraphQLContextFactoryInput) => {
        const actualRequest = req || request;
        return { req: actualRequest ?? { headers: connectionParams ?? {} } };
      },
      sortSchema: true,
      playground: true,
    }),
    MongodbModule,
    RedisModule,
    AuthModule,
    UsersModule,
    WellsModule,
    ProductionModule,
  ],

  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: GqlAuthGuard,
    // },
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
export class AppModule {}
