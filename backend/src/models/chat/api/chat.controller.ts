import { Delete, Get, Param, ParseArrayPipe, ParseIntPipe, Put, Req, Res, Query } from '@nestjs/common';
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatChannel } from '../entities/chatChannel.entity';
import { ChannelDto, LogDto, PasswordDto} from './dto/create-channel.dto';
import { ChatService } from './services/chat.service';
import { ChatUserService } from './services/chatUser.service';
import { Request, Response } from "express";


@Controller('chat')
export class ChatController {
	constructor(
		private chatService: ChatService,
		private userService: ChatUserService,
	){}

	@Get()
	async getMyChannels() : Promise<ChatChannel[]> {
		//const user = await this.userService.getUserOne(3);
		return this.chatService.getMyChannels(78);
	}

	@Get('/add')
	getAllChannels() : Promise<ChatChannel[]> {
		return this.chatService.getAllChannels();
	}

	@Get('/serch/:string')
	getSerchChannels(
		@Param('string', ParseArrayPipe) str : string
	) : Promise<ChatChannel[]> {
		return this.chatService.getSerchChannels(str);
	}

	@Get('/new')
	createChanneluser() {
		return this.chatService.createChannelUser(88, 33);
	}

	@Get('/:id/log')
	async getMessageLog(
		@Query('take') take : number = 1,
		@Query('skip') skip : number = 1,
		@Param('id', ParseIntPipe) id: number
	) {
		take = take > 20 ? 20 : take;
		const user = await this.userService.getUserOne(1);
		const messages = await this.chatService.getMessageLog(take, skip, id, user.user_id);
		const users = await this.userService.getUsersFromChannel(id);
		//const newObj = Object.assign(users, messages);
		return messages;
	}

	// @Post('/:id/logAdd')
	// logAdd(
	// 	@Param('id', ParseIntPipe) id: number,
	// 	@Body() logDto: LogDto,
	// ) {

	// }

	@Post('/create')
	async creatChatRoom(
		@Body() channelDto: ChannelDto
	) : Promise<ChatChannel> {
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
	
	@Post("/:id/join")
	async newChannelUser(
		@Param('id', ParseIntPipe) id: number,
		@Body() pass: PasswordDto,
	) {
		const user = await this.userService.getUserOne(11);
		return this.chatService.newChannelUser(id, pass, user.user_id);
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
		@Param('id', ParseIntPipe) id
	): Promise<void> {
		return this.chatService.deleteChatRoom(id);
	}
}
