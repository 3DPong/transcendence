import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/models/user/api';
import { User } from 'src/models/user/entities/user.entity';
import { ChannelBanList, ChannelMuteList, ChannelUser, ChatChannel, DmChannel, MessageLog } from '../entities';
import { ChatSocketModule } from '../socket/chatSocket.module';
import { ChatController } from './chat.controller';
import { ChatService } from './services';
import { ChatUserService } from './services/chatUser.service';

@Module({
  imports: [
    ChatSocketModule,
    TypeOrmModule.forFeature([
      ChatChannel, 
      User,
      ChannelUser, 
      DmChannel,
      MessageLog,
      ChannelBanList, 
      ChannelMuteList
    ])],
  controllers: [ChatController],
  providers: [ChatService, ChatUserService],
})
export class ChatModule {}
