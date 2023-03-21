import { Delete, Get, Param, ParseArrayPipe, ParseIntPipe, Put, Req, Res } from '@nestjs/common';
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatChannel } from '../entities/chatChannel.entity';
import { ChannelDto} from './dto/create-channel.dto';
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
	async getMyChannels(@Res() res: Response) : Promise<ChatChannel[]> {
		//const user = await this.userService.getUserOne(3);
		return this.chatService.getMyChannels(res, 88);
	}

	@Get('/add')
	getAllChannels(@Res() res: Response) : Promise<ChatChannel[]> {
		return this.chatService.getAllChannels(res);
	}

	@Get('/serch/:string')
	getSerchChannels(
		@Res() res : Response,
		@Param('string', ParseArrayPipe) str : string
	) : Promise<ChatChannel[]> {
		return this.chatService.getSerchChannels(res, str);
	}

	@Get('/new')
	createChanneluser(@Res() res: Response) {
		return this.chatService.createChannelUser(res, 72, 60);
	}

	@Post('/create')
	async creatChatRoom(
		@Res() res: Response,
		@Body() channelDto: ChannelDto
	) : Promise<ChatChannel> {
		const user = await this.userService.getUserOne(48);
		return  this.chatService.creatChatRoom(res, channelDto, user);
	}

	@Post('/:id/update')
	async updateChatRoom(
		@Res() res: Response,
		@Param('id', ParseIntPipe) id: number,
		@Body() channelDto: ChannelDto,
	) : Promise <void> {
		console.log("update come")
		const user = await this.userService.getUserOne(78);
		return this.chatService.updateChatRoom(res, id, channelDto, user);
	}
	
	@Put("/:id/out")
	async leaveChannel(
		@Res() res: Response,
		@Param('id', ParseIntPipe) id: number
	) {
		const user = await this.userService.getUserOne(88);
		return this.chatService.leaveChannel(res, user.user_id, id);
	}

	@Delete('/:id/del')
	deleteChatRoom(
		@Res() res: Response,
		@Param('id', ParseIntPipe) id,
	): Promise<void> {
		return this.chatService.deleteChatRoom(res, id);
	}
}
