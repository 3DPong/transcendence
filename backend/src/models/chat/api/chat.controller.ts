import { Get } from '@nestjs/common';
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatChannel } from '../entities/chatChannel.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { GetUser } from './get-user.decorator';
import { ChatService } from './services/chat.service';
import { ChatUserService } from './services/chatUser.service';

@Controller('chat')
export class ChatController {
	constructor(
		private chatService: ChatService,
		private userService: ChatUserService,
	){}

	@Get()
	getAllChannels( ) : Promise<ChatChannel[]> {
		console.log("get channels")
		return this.chatService.getAllChannels();
	}

	@Post('/create')
	async creatChatRoom(
		@Body() createChannelDto: CreateChannelDto,
	) : Promise<ChatChannel> {
		const user = await this.userService.getUserOne(8);
		return  this.chatService.creatChatRoom(createChannelDto, user);
	}


}
