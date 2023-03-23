import { Delete, Get, Param, ParseArrayPipe, ParseIntPipe, Put, Query,Body, Controller, Post} from '@nestjs/common';
import { ChatChannel } from '../entities/chatChannel.entity';
import { ChannelDto, PasswordDto} from './dto/create-channel.dto';
import { Request, Response } from "express";
import { ChatUserService } from './services/chatUser.service';
import { ChatService } from './services/chat.service';
import { ChannelUser, ChannelUserRoles } from '../entities/channelUser.entity';


@Controller('/chat')
export class ChatController {
	constructor(private chatService: ChatService, private userService: ChatUserService) {}

  /*
    임시 함수
  */
	@Get('/new')
	createChannelUser() {
		return this.chatService.createChannelUser(88, 33, ChannelUserRoles.USER);
	}

	@Get()
	async getMyChannels() : Promise<ChatChannel[]> {
		//const user = await this.userService.getUser(3);
		return this.chatService.getMyChannels(78);
	}

	@Get('/add')
	getAllChannels() : Promise<ChatChannel[]> {
		return this.chatService.getAllChannels();
	}

	@Get('/search/:string')
	getSearchChannels(@Param('string', ParseArrayPipe) str : string) : Promise<ChatChannel[]> {
		return this.chatService.getSearchChannels(str);
	}

	@Get('/:id/log')
	async getMessageLogs(
		@Query('take') take : number = 1,
		@Query('skip') skip : number = 1,
		@Param('id', ParseIntPipe) id: number
	) {
		take = take > 20 ? 20 : take;
		const user = await this.userService.getUser(1);
		const messages = await this.chatService.getMessageLogs(take, skip, id, user.user_id);
		return messages;
	}

	@Get('/:id/users')
	getUsersInfo (@Param('id', ParseIntPipe) id: number) {
		return this.userService.getChatUsers(id);
	}
	

	// @Post('/:id/logAdd')
	// logAdd(
	// 	@Param('id', ParseIntPipe) id: number,
	// 	@Body() logDto: LogDto,
	// ) {

	// }

	@Post('/create')
	async creatChatRoom(@Body() channelDto: ChannelDto) : Promise<ChatChannel> {
		console.log("ce")
		const user = await this.userService.getUser(82);
		return  this.chatService.creatChatRoom(channelDto, user);
	}

	@Post('/:id/update')
	async updateChatRoom(@Param('id', ParseIntPipe) id: number, @Body() channelDto: ChannelDto) : Promise <void> {
		const user = await this.userService.getUser(78);
		return this.chatService.updateChatRoom(id, channelDto, user);
	}
	
	@Post("/:id/join")
	async joinChannelUser(@Param('id', ParseIntPipe) id: number, @Body() pass: PasswordDto) : Promise <ChannelUser> {
		const user = await this.userService.getUser(76);
		return this.chatService.joinChannelUser(id, pass, user.user_id);
	}

	@Put("/:id/out")
	async leaveChannel(@Param('id', ParseIntPipe) id: number) {
		const user = await this.userService.getUser(76);
		return this.chatService.leaveChannel(user.user_id, id);
	}

	@Delete('/:id/del')
	deleteChatRoom(@Param('id', ParseIntPipe) id): Promise<void> {
		return this.chatService.deleteChatRoom(id);
	}
  
}
