import { Module } from '@nestjs/common';
import { ChatSocketGateway } from './chatSocket.gateway';
import { ChatSocketService } from './services/chatSocket.service';

@Module({
	providers: [ChatSocketGateway, ChatSocketService]
})
export class ChatSocketModule {}
