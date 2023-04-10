import { Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChannelBanList, ChannelMuteList, ChannelUser, ChannelUserRoles, DmChannel, MessageLog } from '../../entities';
import { ChannelType, ChatChannel } from '../../entities/chatChannel.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageDto, toggleDto, toggleTimeDto } from '../../dto/socket.dto';
import {SocketException, SocketExceptionFilter} from '../socket.filter';
import { Server, Socket } from 'socket.io';


@Injectable()
export class ChatSocketService {
  constructor(
    @InjectRepository(ChatChannel)
    private channelRepository: Repository<ChatChannel>,
    
    @InjectRepository(ChannelUser)
    private channelUserRepository: Repository<ChannelUser>,
    
    @InjectRepository(MessageLog)
    private messageLogRepository: Repository<MessageLog>,

    @InjectRepository(DmChannel)
    private dmRepository: Repository<DmChannel>,

    @InjectRepository(ChannelBanList)
    private banRepository: Repository<ChannelBanList>,

    @InjectRepository(ChannelMuteList)
    private muteRepository: Repository<ChannelMuteList>,

    private dataSource: DataSource

  ) {}

  async joinAllChatRooms(socket: Socket, user_id: number) {
    const channelIds = await this.getAllUserChannel(user_id);
    channelIds.forEach(id => { socket.join(`chat_${id.toString()}`);});
  }

  async getAllUserChannel(user_id:number) {
    try {
      const channelUsers : ChannelUser[]  = await this.channelUserRepository
        .createQueryBuilder("cu")
        .select("cu.channel_id")
        .where('cu.user_id = :user_id', {user_id})
        .getMany();
      const channelIds = channelUsers.map((user)=>user.channel_id)

      const dmChannels : DmChannel[] = await this.dmRepository
        .createQueryBuilder("dm")
        .select("dm.channel_id")
        .where('dm.first_user_id = :user_id', {user_id})
        .orWhere('dm.second_user_id = :user_id', {user_id})
        .getMany();
      dmChannels.map((dm) => channelIds.push(dm.channel_id));

      return channelIds;
    } catch (error) {
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  }

  async enterChatRoom(socket: Socket, channel_id: number, user_id: number) {
    
    const userNickname = await this.getChannelUserName(channel_id, user_id);
    if (!user_id || !userNickname)
      throw new SocketException('Forbidden', `권한이 없습니다!`);
    
    try {

      socket.broadcast
       .to(`chat_${channel_id}`)
       .emit('message', { message: `${userNickname} 가 들어왔습니다.` });

    } catch (error) {
      throw new SocketException('InternalServerError', `${error.message}`);
    }
}

  async leaveChatRoom(socket: Socket, channel_id: number, user_id: number) {

    const userNickname = await this.getChannelUserName(channel_id, user_id);
    if (!user_id || !userNickname)
      throw new SocketException('Forbidden', `권한이 없습니다!`);

    try {
      socket.leave(`chat_${channel_id}`);
      socket.broadcast
      .to(`chat_${channel_id}`)
      .emit('message', { message: `${userNickname} 가 나갔습니다.`});

    } catch (error) {
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  } 


async sendChatMessage(server: Server, user_id: number, md: MessageDto) {
  
  if (!user_id)
    throw new SocketException('Forbidden', `권한이 없습니다!`);
  if (md.message === "" || isWhitespace(md.message))
    throw new SocketException('BadRequest', `내용을 입력해주세요!`);

  let dmUser;
  const channel = await this.getChannelType(md.channel_id);
  if (!channel) {
    throw new SocketException('BadRequest', `채널을 찾을 수 없습니다!`);
  } else if (channel.type === ChannelType.DM && !(dmUser = await this.getDmUser(md.channel_id, user_id))) {
    throw new SocketException('BadRequest', `디엠 유저를 찾을 수 없습니다!`);
  } else if (channel.type !== ChannelType.DM && !await this.checkChannelUser(md.channel_id, user_id)) {
    throw new SocketException('BadRequest', `채팅 유저를 찾을 수 없습니다!`);
  }

  if (await this.checkMuteUser(md.channel_id, user_id)) {
    throw new SocketException('Forbidden', `뮤트 상태입니다!`);
  }

  try {
    const newMessage = await this.createMessageLog(user_id, md, channel.type);
    if (!newMessage)
      throw new SocketException('InternalServerError', `메세지가 전송 실패!`);
    delete newMessage.channel;

    if (channel.type === ChannelType.DM) {
      await this.updateDmUser(dmUser);
    }

    server
    .to(`chat_${md.channel_id}`)
    .emit('chat', newMessage);

  } catch (error) {
    throw new SocketException('InternalServerError', `${error.message}`);
  }
}

async muteUser(server: Server, adminId: number, muteDto: toggleTimeDto ) {

  const {user_id, channel_id} = muteDto;

  if (!adminId ||
    !(await this.checkAdminUser(channel_id, adminId)) ||
    !(await this.checkChannelUserRole(channel_id, user_id)))
      throw new SocketException('Forbidden', `권한이 없습니다!`);

  try {
    const nickname = await this.getChannelUserName(channel_id, user_id)
    const muted = await this.checkMuteUser(channel_id, user_id);

    if (muted) {
      await this.unmuteUser(channel_id, user_id);
      server.to(`chat_${channel_id}`)
        .emit('mute', { user_id: user_id, channel_id: channel_id, message: `${nickname} 가 뮤트 해제 되었습니다.` });
    } else {
      if (muteDto.end_at === null) {
        throw new SocketException('BadRequest', `뮤트 해제 시간을 추가하세요!`);
      }
      const mute = await this.createMuteUser(muteDto);
      if (!mute) {
        throw new SocketException('InternalServerError', `뮤트 실패!`);
      }
      server.to(`chat_${channel_id}`)
        .emit('mute', { user_id: user_id, channel_id: channel_id,  message: `${nickname} 가 뮤트 되었습니다.` });
    }
  } catch (error) {
    throw new SocketException('InternalServerError', `${error.message}`);
  }
}

async banUser(server: Server, adminId: number, banDto: toggleTimeDto, userSocket: string) {

  const {user_id, channel_id} = banDto;

  if (!adminId ||
    !(await this.checkAdminUser(channel_id, adminId)) ||
    !(await this.checkChannelUserRole(channel_id, user_id)))
      throw new SocketException('Forbidden', `권한이 없습니다!`);
  try {
    const banned = await this.checkBanUser(channel_id, user_id);
    const nickname = await this.getChannelUserName(channel_id, user_id) 

    if (banned) {
      throw new SocketException('Conflict', `이 유저는 이미 밴 상태입니다!`);
    } else {
      const banned = await this.createBanUser(banDto);
      if (!banned) {
        throw new SocketException('InternalServerError', `밴 실패!`);
      }
      await this.deleteChannlUser(channel_id, user_id);

      if (userSocket) {
        server.in(userSocket).socketsLeave(`chat_${channel_id}`);
      }
      const title = await this.getChannelName(channel_id)
      server.in(userSocket)
        .emit('alarm', {type: 'ban', channel_id: channel_id, message: `${title }에서 밴 되었습니다.`}) //당사자
      server.to(`chat_${channel_id}`)
        .emit('ban', {  user_id: user_id, channel_id: channel_id, message: `${nickname} 가 밴 되었습니다.` }); //일반 유저들
    }
  } catch (error) {
    throw new SocketException('InternalServerError', `${error.message}`);
  }
}

async unBanUser(server: Server, adminId: number, unbanDto: toggleDto) {

  const {user_id, channel_id} = unbanDto;

  if (!adminId ||
    !(await this.checkAdminUser(channel_id, adminId)))
      throw new SocketException('Forbidden', `권한이 없습니다!`);
  
  try {
    const banned = await this.checkBanUser(channel_id, user_id);
    const nickname = await this.getChannelUserName(channel_id, user_id);
    if (banned) {
      await this.releaseBanUser(channel_id, user_id);
      server.to(`chat_${channel_id}`)
        .emit('ban', {  user_id: user_id, channel_id: channel_id, message: `${nickname} 가 밴 해제 되었습니다.` });
    }  else {
      throw new SocketException('Conflict', `밴 유저가 아닙니다!`);
    }
  } catch (error) {
    throw new SocketException('InternalServerError', `${error.message}`);
  }
}

async kickUser(server: Server, adminId: number, kickDto: toggleDto, userSocket: string) {

  const {user_id, channel_id} = kickDto;

  if (!adminId ||
    !(await this.checkAdminUser(channel_id, adminId)) ||
    !(await this.checkChannelUserRole(channel_id, user_id)))
      throw new SocketException('Forbidden', `권한이 없습니다!`);
  try {

    let nickname = await this.getChannelUserName(channel_id, user_id)
    await this.deleteChannlUser(channel_id, user_id);

   if (userSocket)
    server.in(userSocket).socketsLeave(`chat_${channel_id}`);
  
    if (nickname) {
      const title = await this.getChannelName(channel_id)
      server.in(userSocket)
        .emit('alarm', {type: 'kick', channel_id: channel_id, message: `${title }에서 강제 퇴장  되었습니다.`}) //당사자
      server.to(`chat_${channel_id}`)
        .emit(`kick`,  { user_id: user_id, channel_id: channel_id,  message: `${nickname} 가 강제 퇴장 되었습니다.` }); //일반유저
    }
  } catch (error) {
    throw new SocketException('InternalServerError', `${error.message}`);
  }
}



  async createMessageLog(user_id: number, md: MessageDto, type: ChannelType) :Promise<MessageLog> {
    const newLog = this.messageLogRepository.create({
      channel_id: md.channel_id,
      user_id,
      content: md.message
    });
    try {
      await this.messageLogRepository.save(newLog);
      return newLog;
    } catch (error) {
        throw new InternalServerErrorException();
    }
  }

  async updateDmUser(dmUser: DmChannel){
   await this.dmRepository
    .update({first_user_id: dmUser.first_user_id, second_user_id:dmUser.second_user_id}, {updated_at: new Date()});
  }

  async createMuteUser(muteDto: toggleTimeDto) :Promise<ChannelMuteList> {
    const muteUser = this.muteRepository.create({
      user_id: muteDto.user_id,
      channel_id: muteDto.channel_id,
      end_at: muteDto.end_at
    });
    await this.muteRepository.save(muteUser);
    return muteUser;
  }

  async createBanUser(banDto: toggleTimeDto) :Promise<ChannelBanList> {
    const banUser = this.banRepository.create({
      user_id: banDto.user_id,
      channel_id: banDto.channel_id,
      end_at: banDto.end_at
    });
    await this.banRepository.save(banUser);
    return banUser;
  }

  async deleteChannlUser(channel_id: number, user_id: number) {
    return await this.channelUserRepository.softDelete({channel_id, user_id});
  }

  async unmuteUser(channel_id: number, user_id: number) {
    const result = await this.muteRepository.delete({channel_id, user_id});
    if (result.affected === 0)
      throw new NotFoundException(`Cant't find mute id ${user_id} in ${channel_id}`)
  }

  async releaseBanUser(channel_id: number, user_id: number) {
    const result = await this.banRepository.delete({channel_id, user_id});
    if (result.affected === 0)
      throw new NotFoundException(`Cant't find ban id ${user_id} in ${channel_id}`)
  }

  async checkMuteUser(channel_id: number, user_id: number) : Promise <boolean> {
    const muted = await this.muteRepository.findOne({where: {channel_id, user_id}});
    if (muted) {
      const time = new Date();
      if (muted.end_at > time)
        return true;
    }
    return false;
  }

  async checkBanUser(channel_id: number, user_id: number) : Promise <boolean> {
    const banned = await this.banRepository.findOne({ where: {channel_id, user_id}});
    if (banned) {
      const time = new Date();
      if (banned.end_at > time)
        return true;
    }
    return false;
  }

  async getChannelUserName(channel_id: number, user_id: number) :Promise<string>  {
    const chatUser = await this.channelUserRepository.findOne({where: {channel_id, user_id}});
    if (chatUser)
      return chatUser.user.nickname;
    return null;
  }

  async checkChannelUser(channel_id: number, user_id: number) :Promise<boolean>   {
    const chatUser = await this.channelUserRepository.findOne({where: {channel_id, user_id}});
    if (chatUser)
      return true;
    return false;
  }


  async checkChannelUserRole(channel_id: number, user_id: number) :Promise <boolean>   {
    const chatUser = await this.channelUserRepository.findOne({where: {channel_id, user_id, role: ChannelUserRoles.USER}});
    if (!chatUser)
      return false;
    return true;
  }
  
  async checkAdminUser(channel_id: number, user_id: number) : Promise <boolean> {
    const channelUser = await this.channelUserRepository
    .findOne({select: {channel_id:true, user_id:true, role:true}, where: {channel_id, user_id}});
    if (!channelUser || channelUser.role === ChannelUserRoles.USER)
      return false;
    return true;
  }

  async getDmUser(channel_id: number, user_id: number)  : Promise <DmChannel>{
    const dmChannel = await this.dmRepository.findOne({where: {channel_id}});
    if (dmChannel.first_user_id !== user_id && dmChannel.second_user_id !== user_id)
      return null;
    return dmChannel;
  }

  async getChannelType(channel_id: number) : Promise<ChatChannel>{
    const channel = await this.channelRepository.findOne({select: {type:true}, where: {channel_id}})
    if (!channel)
      return null;
    return channel;
  }

  async getChannelName(channel_id: number) : Promise<string>{
    const channel = await this.channelRepository.findOne({select: {name:true}, where: {channel_id}})
    if (!channel)
      return null;
    return channel.name;
  }
}

function isWhitespace(value: string): boolean {
  const pattern = /^\s*$/;
  return pattern.test(value);
}