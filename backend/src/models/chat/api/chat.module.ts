import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/user/entities/user.entity';
import { ChannelBanList, ChannelMuteList, ChannelUser, ChatChannel, DmChannel, MessageLog } from '../entities';
import { ChatController } from './chat.controller';
import { ChatService } from './services';
import { ChatUserService } from './services/chatUser.service';
import { ChatSocketModule } from '../socket';
import { UserRelation } from 'src/models/user/entities';

@Module({
  imports: [
    ChatSocketModule,
    TypeOrmModule.forFeature([
      UserRelation,
      ChatChannel,
      User,
      ChannelUser,
      DmChannel,
      MessageLog,
      ChannelBanList,
      ChannelMuteList,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatUserService],
})
export class ChatModule {}
