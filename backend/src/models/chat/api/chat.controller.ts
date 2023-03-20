import { Delete, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { User } from 'src/models/user/entities/user.entity';
import { ChannelUser } from '../entities/channelUser.entity';
import { ChatChannel } from '../entities/chatChannel.entity';
import { ChannelDto} from './dto/create-channel.dto';
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
		return this.chatService.getMyChannels(48);
	}

	@Get('/add')
	getAllChannels( ) : Promise<ChatChannel[]> {
		return this.chatService.getAllChannels();
	}

	@Get('/new')
	createChanneluser() {
		return this.chatService.createChannelUser(74, 148);
	}


	@Post('/create')
	async creatChatRoom(
		@Body() channelDto: ChannelDto,
	) : Promise<ChatChannel> {
		console.log("create come")
		const user = await this.userService.getUserOne(48);
		return  this.chatService.creatChatRoom(channelDto, user);
	}

	@Post('/:id/update')
	async updateChatRoom(
		@Param('id', ParseIntPipe) id: number,
		@Body() channelDto: ChannelDto,
	) : Promise <void> {
		console.log("update come")
		const user = await this.userService.getUserOne(78);
		return this.chatService.updateChatRoom(id, channelDto, user);
	}
	
	@Put("/:id/out")
	async leaveChannel(
		@Param('id', ParseIntPipe) id: number
	) {
		const user = await this.userService.getUserOne(88);
		return this.chatService.leaveChannel(user.user_id, id);
	}

	@Delete('/:id/del')
	deleteChatRoom(
		@Param('id', ParseIntPipe) id,
	): Promise<void> {
		return this.chatService.deleteChatRoom(id);
	}
}
