import { Module } from '@nestjs/common';
import { NotifierService } from './services/notifier.service';
import { Notifier } from './services/notifier.class';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities';
import { ChatChannel } from '../chat/entities';
import { NotifierGateway } from './notifier.gateway';
import { SocketMapService } from '../../providers/redis/socketMap.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ChatChannel])],
  providers: [Notifier, NotifierService, NotifierGateway, SocketMapService],
  exports: [Notifier, NotifierService, NotifierGateway],
})
export class NotifierModule {}
