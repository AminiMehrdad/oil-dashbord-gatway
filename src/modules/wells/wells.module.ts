import { Module } from '@nestjs/common';

import { RabbitModule } from 'src/common/rabbit/rabbit.module';
import { WellDataGateway } from './gateways/well-data.gateway';
import { DataResolver } from './resolvers/data.resolver';
import { WellPageResolver } from './resolvers/wells-page.resolver';
import { WellService } from './services/well.service';

@Module({
  imports: [RabbitModule],
  providers: [DataResolver, WellPageResolver, WellDataGateway, WellService],
  exports: [WellService],
})
export class WellsModule {}
