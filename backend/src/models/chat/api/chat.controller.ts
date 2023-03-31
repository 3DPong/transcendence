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
  @Post('/new')
  createChannelUser() {
    return this.chatService.createChannelUser(88, 33, ChannelUserRoles.USER);
  }

  @Get()
  getMyChannels() : Promise<ChatChannel[]> {
    //const user = await this.userService.getUser(3);
    return this.chatService.getMyChannels(82);
  }

  @Get('/search')
  getAllChannels() : Promise<ChatChannel[]> {
    return this.chatService.getAllChannels();
  }

  @Get('/search/:string')
  searchChannelsByChannelName(@Param('string') str : string) : Promise<ChatChannel[]> {
    return this.chatService.searchChannelsByChannelName(str);
  }

  @Get('/:channelId/log')
  getMessageLogs (
    @Query('take') take : number = 1,
    @Query('skip') skip : number = 1,
    @Param('channelId', ParseIntPipe) channelId: number
  ) {
    take = take > 20 ? 20 : take;
    return this.chatService.getMessageLogs(take, skip, channelId, 1);
  }

  @Get('/:channelId/users')
  getUsersInfo(@Param('channelId', ParseIntPipe) channelId: number) : Promise <ChannelUser[]> {
    return this.userService.getChatUsers(channelId);
  }
  
  @Get('/:channelId/mutelist')
  getMutelist(@Param('channelId', ParseIntPipe) channelId: number) : Promise <ChannelMuteList[]> {
    return this.chatService.getMutelist(channelId, 1);
  }

  @Get('/:channelId/banlist')
  getBanlist(@Param('channelId', ParseIntPipe) channelId: number) : Promise <ChannelBanList[]> {
    return this.chatService.getBanlist(channelId, 1);
  }

  @Post('/')
  async createChatRoom(@Body() channelDto: ChannelDto) : Promise<ChatChannel> {
    const user = await this.userService.getUser(82);
    return  this.chatService.createChatRoom(channelDto, user);
  }

  @Put('/:channelId/update')
  async updateChatRoom(@Param('channelId', ParseIntPipe) channelId: number, @Body() channelDto: ChannelDto) : Promise <void> {
    const user = await this.userService.getUser(82);
    return this.chatService.updateChatRoom(channelId, channelDto, user);
  }
  
  @Post("/join")
  joinChannelUser(@Body() joinDto: JoinDto) : Promise <ChannelUser> {
    return this.chatService.joinChannelUser(joinDto, 76);
  }

  @Put("/:channelId/out")
  leaveChannel(@Param('channelId', ParseIntPipe) channelId: number) {
    return this.chatService.leaveChannel(51, channelId);
  }

  @Put("/:channelId/role")
  changeRole( @Param('channelId', ParseIntPipe) channelId: number, @Body() userIdDto: UserIdDto ) {
    return this.chatService.changeRole(channelId, 1, userIdDto);
  }

  @Delete('/:channelId')
  deleteChatRoom(@Param('channelId', ParseIntPipe) channelId): Promise<void> {
    return this.chatService.deleteChatRoom(channelId);
  }
  
}
