import { Module } from '@nestjs/common';

import { RabbitMQService } from './rabbitmq.service';
import { RealtimeService } from './realtime.service';

@Module({
  providers: [RabbitMQService, RealtimeService],
  exports: [RabbitMQService, RealtimeService],
})
export class RabbitModule {}
