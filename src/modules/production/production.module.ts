import { Module } from '@nestjs/common';

import { RabbitModule } from 'src/shared/rabbit/rabbit.module';
import { ProductionPageResolver } from './resolvers/production-page.resolver';
import { ProductionService } from './services/production.service';

@Module({
  imports: [RabbitModule],
  providers: [ProductionPageResolver, ProductionService],
})
export class ProductionModule {}
