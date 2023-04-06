import { Module } from '@nestjs/common';
import { NotifierService } from './services/notifier.service';
import { Notifier } from './services/notifier.class';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities';
import { ChatChannel } from '../chat/entities';
import { UserNotifyGateway } from './userNotify.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User, ChatChannel])],
  providers: [Notifier, NotifierService, UserNotifyGateway],
  exports: [Notifier, NotifierService, UserNotifyGateway],
})
export class NotifierModule {}
