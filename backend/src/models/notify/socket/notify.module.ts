import { Module } from '@nestjs/common';
import { NotifyService } from './services';
import { NotifyGateway } from './notify.gateway';

@Module({
  providers: [NotifyGateway, NotifyService],
})
export class NotifyModule {}
