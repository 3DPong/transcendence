import { Module } from '@nestjs/common';
import { UserStatusSocketService } from './services';
import { UserStatusSocketGateway } from './userStatusSocket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../user/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserStatusSocketGateway, UserStatusSocketService],
})
export class UserStatusSocketModule {}
