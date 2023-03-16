import { Module } from '@nestjs/common';
import { ChatSocketModule } from '../socket/chatSocket.module';
import { ChatController } from './chat.controller';
import { ChatService } from './services';

@Module({
  imports: [ChatSocketModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
