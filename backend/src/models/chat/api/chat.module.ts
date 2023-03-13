import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './services';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
