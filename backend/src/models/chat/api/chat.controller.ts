import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChannelBanList, ChannelMuteList, ChannelUser, ChatChannel } from '../entities';
import { JwtPayloadInterface } from '../../../common/interfaces/JwtUser.interface';
import { JwtGuard } from '../../../common/guards/jwt/jwt.guard';
import { GetGuardData } from '../../../common/decorators';
import { ChatUserService } from './services/chatUser.service';
import { ChatService } from './services';
import { ChannelDto, JoinDto, UserIdDto } from '../dto/channel.dto';
import { DmDto } from '../dto/dm.dto';
import { ChannelInterface, ChatUser } from '../socket/chat.interface';

@UseGuards(JwtGuard)
@Controller('/chat')
export class ChatController {
  constructor(private chatService: ChatService, private userService: ChatUserService) {}

  @Get()
  getMyChannels(@GetGuardData() data: JwtPayloadInterface): Promise<ChatChannel[]> {
    return this.chatService.getMyChannels(data.user_id);
  }

  @Get('/search')
  getAllChannels(): Promise<ChatChannel[]> {
    return this.chatService.getAllChannels();
  }

  @Get('/search/:string')
  searchChannelsByChannelName(@Param('string') str: string): Promise<ChatChannel[]> {
    return this.chatService.searchChannelsByChannelName(str);
  }

  @Get('/:channelId/log')
  getMessageLogs(
    @GetGuardData() data: JwtPayloadInterface,
    @Query('take') take = 1,
    @Query('skip') skip = 1,
    @Param('channelId', ParseIntPipe) channelId: number
  ) {
    take = take > 20 ? 20 : take;
    return this.chatService.getMessageLogs(take, skip, channelId, data.user_id);
  }

  @Get('/:channelId/users')
  getUsersInfo(@Param('channelId', ParseIntPipe) channelId: number) {
    return this.chatService.getChatUsers(channelId);
  }

  @Get('/:channelId/dm/users')
  getDmUsersInfo(@Param('channelId', ParseIntPipe) channelId: number): Promise<ChatUser[]> {
    return this.chatService.getDmUsers(channelId);
  }

  @Get('/:channelId/mutelist')
  getMuteList(
    @GetGuardData() data: JwtPayloadInterface,
    @Param('channelId', ParseIntPipe) channelId: number
  ): Promise<ChannelMuteList[]> {
    return this.chatService.getMuteList(channelId);
  }

  @Get('/:channelId/banlist')
  getBanList(
    @GetGuardData() data: JwtPayloadInterface,
    @Param('channelId', ParseIntPipe) channelId: number
  ): Promise<ChannelBanList[]> {
    return this.chatService.getBanList(channelId, data.user_id);
  }

  @Post('/')
  async createChatRoom(
    @GetGuardData() data: JwtPayloadInterface,
    @Body() channelDto: ChannelDto
  ): Promise<ChannelInterface> {
    const user = await this.userService.getUser(data.user_id);
    return this.chatService.createChatRoom(channelDto, user);
  }

  @Put('/:channelId/update')
  async updateChatRoom(
    @GetGuardData() data: JwtPayloadInterface,
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body() channelDto: ChannelDto
  ): Promise<void> {
    const user = await this.userService.getUser(data.user_id);
    return this.chatService.updateChatRoom(channelId, channelDto, user);
  }

  @Post('/join')
  joinChannelUser(@GetGuardData() data: JwtPayloadInterface, @Body() joinDto: JoinDto): Promise<ChannelUser> {
    return this.chatService.joinChannelUser(joinDto, data.user_id);
  }

  @Put('/:channelId/out')
  leaveChannel(@GetGuardData() data: JwtPayloadInterface, @Param('channelId', ParseIntPipe) channelId: number) {
    return this.chatService.leaveChannel(data.user_id, channelId);
  }

  @Put('/:channelId/role')
  changeRole(
    @GetGuardData() data: JwtPayloadInterface,
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body() userIdDto: UserIdDto
  ) {
    return this.chatService.changeRole(channelId, data.user_id, userIdDto);
  }

  @Delete('/:channelId')
  deleteChatRoom(@Param('channelId', ParseIntPipe) channelId): Promise<void> {
    return this.chatService.deleteChatRoom(channelId);
  }

  @Post('/dm')
  async createDmRoom(@GetGuardData() data: JwtPayloadInterface, @Body() dmDto: DmDto): Promise<ChannelInterface> {
    const first_user = await this.userService.getUser(data.user_id);
    const second_user = await this.userService.getUser(dmDto.user_id);
    if (!second_user) throw new NotFoundException('Dm을 신청 할 수 없습니다!');
    return this.chatService.createDmRoom(first_user, second_user);
  }
}
