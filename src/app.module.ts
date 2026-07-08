import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { ProductionModule } from './modules/production/production.module';
import { UsersModule } from './modules/users/users.module';
import { WellsModule } from './modules/wells/wells.module';
import { MongodbModule } from './shared/mongodb/mongodb.module';
import { RedisModule } from './shared/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './common/guards/access-token.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    JwtModule.register({ global: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }),
      formatError: (error) => error,
    }),
    MongodbModule,
    RedisModule,
    AuthModule,
    UsersModule,
    WellsModule,
    ProductionModule,
  ],

  providers: [
    {
       provide: APP_GUARD,
       useClass: AccessTokenGuard 
    },
    { 
      provide: APP_GUARD, 
      useClass: RolesGuard 
    },
    { 
      provide: APP_INTERCEPTOR, 
      useClass: LoggingInterceptor 
    },
    { 
      provide: APP_FILTER, 
      useClass: AllExceptionsFilter 
    },
  ],
})
export class AppModule { }
