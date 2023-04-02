import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSocketGateway } from './chatSocket.gateway';
import { ChatSocketService } from './services/chatSocket.service';
import { ChannelBanList, ChannelMuteList, ChannelUser, ChatChannel, DmChannel, MessageLog } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatChannel,
      ChannelUser, 
      DmChannel,
      MessageLog,
      ChannelBanList, 
      ChannelMuteList
    ])],
  providers: [ChatSocketGateway, ChatSocketService]
})
export class ChatSocketModule {}
