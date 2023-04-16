import { Module } from '@nestjs/common';
import { NotifySocketService } from './services';
import { NotifySocketGateway } from './notifySocket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../user/entities';
import { NotifierModule } from '../../notifier/notifier.module';
import { SocketMapService } from '../../../providers/redis/socketMap.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), NotifierModule],
  providers: [NotifySocketGateway, NotifySocketService, SocketMapService],
})
export class NotifySocketModule {}
