import { Get } from '@nestjs/common';
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { User } from 'src/models/user/entities/user.entity';
import { ChannelUser } from '../entities/channelUser.entity';
import { ChatChannel } from '../entities/chatChannel.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { GetUser } from './get-user.decorator';
import { ChatService } from './services/chat.service';
import { ChatUserService } from './services/chatUser.service';

@Controller('room')
export class ChatController {
	constructor(
		private chatService: ChatService,
		private userService: ChatUserService,
	){}

	@Get()
	async getMyChannels() : Promise<ChatChannel[]> {
		//const user = await this.userService.getUserOne(3);
		return this.chatService.getMyChannels(8);
	}

	@Get('/add')
	getAllChannels( ) : Promise<ChatChannel[]> {
		return this.chatService.getAllChannels();
	}

	// @Post('/new')
	// createChanneluser() {
	// 	return this.chatService.createChannelUser(8, 74);
	// }

	@Post('/create')
	async creatChatRoom(
		@Body() createChannelDto: CreateChannelDto,
	) : Promise<ChatChannel> {
		const user = await this.userService.getUserOne(8);
		return  this.chatService.creatChatRoom(createChannelDto, user);
	}

}
