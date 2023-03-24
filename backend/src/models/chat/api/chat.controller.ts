import { Delete, Get, Param, ParseArrayPipe, ParseIntPipe, Put, Query,Body, Controller, Post} from '@nestjs/common';
import { ChatChannel } from '../entities/chatChannel.entity';
import { ChannelDto, JoinDto, UserIdDto} from './dto/create-channel.dto';
import { Request, Response } from "express";
import { ChatUserService } from './services/chatUser.service';
import { ChatService } from './services/chat.service';
import { ChannelUser, ChannelUserRoles } from '../entities/channelUser.entity';
import { ChannelBanList, ChannelMuteList } from '../entities';


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
	getMyChannels() : Promise<ChatChannel[]> {
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
	getMessageLogs (
		@Query('take') take : number = 1,
		@Query('skip') skip : number = 1,
		@Param('id', ParseIntPipe) id: number
	) {
		take = take > 20 ? 20 : take;
		return this.chatService.getMessageLogs(take, skip, id, 1);
	}

	@Get('/:id/users')
	getUsersInfo (@Param('id', ParseIntPipe) id: number) : Promise <ChannelUser[]> {
		return this.userService.getChatUsers(id);
	}
	
	@Get('/:id/mutelist')
	getMutelist (@Param('id', ParseIntPipe) id: number) : Promise <ChannelMuteList[]> {
		return this.chatService.getMutelist(id, 1);
	}

	@Get('/:id/banlist')
	getBanlist (@Param('id', ParseIntPipe) id: number) : Promise <ChannelBanList[]> {
		return this.chatService.getBanlist(id, 1);
	}
	
	// @Put('/:id/mute')
	// getMutelist (@Param('id', ParseIntPipe) id: number) : Promise <ChannelMuteList[]> {
	// 	return this.chatService.getMutelist(id, 1);
	// }

	// @Get('/:id/banlist')
	// getBanlist (@Param('id', ParseIntPipe) id: number) : Promise <ChannelBanList[]> {
	// 	return this.chatService.getBanlist(id, 1);
	// }


	// @Post('/:id/logAdd')
	// logAdd(
	// 	@Param('id', ParseIntPipe) id: number,
	// 	@Body() logDto: LogDto,
	// ) {

	// }

	@Post('/create')
	async creatChatRoom(@Body() channelDto: ChannelDto) : Promise<ChatChannel> {
		const user = await this.userService.getUser(82);
		return  this.chatService.creatChatRoom(channelDto, user);
	}

	@Put('/:id/update')
	async updateChatRoom(@Param('id', ParseIntPipe) id: number, @Body() channelDto: ChannelDto) : Promise <void> {
		const user = await this.userService.getUser(78);
		return this.chatService.updateChatRoom(id, channelDto, user);
	}
	
	@Post("/join")
	joinChannelUser(@Body() joinDto: JoinDto) : Promise <ChannelUser> {
		return this.chatService.joinChannelUser(joinDto, 76);
	}

	@Put("/:id/out")
	leaveChannel(@Param('id', ParseIntPipe) id: number) {
		return this.chatService.leaveChannel(76, id);
	}

	@Put("/:id/changerole")
	changeRole( @Param('id', ParseIntPipe) id: number, @Body() userIdDto: UserIdDto ) {
		return this.chatService.changeRole(id, 1, userIdDto);
	}

	@Delete('/:id/del')
	deleteChatRoom(@Param('id', ParseIntPipe) id): Promise<void> {
		return this.chatService.deleteChatRoom(id);
	}
  
}
