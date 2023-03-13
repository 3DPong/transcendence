import { Module } from '@nestjs/common';
import { AlarmGateway } from './alarm.gateway';
import { AlarmService } from './services';

@Module({
  providers: [AlarmGateway, AlarmService],
})
export class AlarmModule {}
