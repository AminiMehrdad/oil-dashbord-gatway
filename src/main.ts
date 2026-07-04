import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';

import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  await app.listen(
    process.env.PORT ? Number(process.env.PORT) : 5000,
    '0.0.0.0',
  );

  Logger.log(`Gateway is running on port ${process.env.PORT ?? 5000} ...`);
}
void bootstrap();
