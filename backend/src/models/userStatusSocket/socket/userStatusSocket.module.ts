import { Module } from '@nestjs/common';
import { UserStatusSocketService } from './services';
import { UserStatusSocketGateway } from './userStatusSocket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../user/entities';
import { NotifierModule } from '../../notifier/notifier.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), NotifierModule],
  providers: [UserStatusSocketGateway, UserStatusSocketService],
})
export class UserStatusSocketModule {}
