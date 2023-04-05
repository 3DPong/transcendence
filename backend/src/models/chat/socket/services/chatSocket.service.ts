import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChannelBanList, ChannelMuteList, ChannelUser, ChannelUserRoles, DmChannel, MessageLog } from '../../entities';
import { ChannelType, ChatChannel } from '../../entities/chatChannel.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageDto, toggleTimeDto } from '../../dto/socket.dto';
import { date } from 'joi';


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
        console.log(error)
        throw new InternalServerErrorException();
    }
  }

  async updateDmUser(dmUser: DmChannel){
   await this.dmRepository
    .update({first_user_id: dmUser.first_user_id, second_user_id:dmUser.second_user_id}, {updated_at: new Date()});
  }

  async muteUser(muteDto: toggleTimeDto) :Promise<ChannelMuteList> {
    const muteUser = this.muteRepository.create({
      user_id: muteDto.user_id,
      channel_id: muteDto.channel_id,
      end_at: muteDto.end_at
    });
    await this.muteRepository.save(muteUser);
    return muteUser;
  }

  async banUser(banDto: toggleTimeDto) :Promise<ChannelBanList> {
    const banUser = this.banRepository.create({
      user_id: banDto.user_id,
      channel_id: banDto.channel_id,
      end_at: banDto.end_at
    });
    await this.banRepository.save(banUser);
    return banUser;
  }

  async kickUser(channel_id: number, user_id: number) {
    return await this.channelUserRepository.softDelete({channel_id, user_id});
  }

  async unmuteUser(channel_id: number, user_id: number) {
    const result = await this.muteRepository.delete({channel_id, user_id});
    if (result.affected === 0)
      throw new NotFoundException(`Cant't find mute id ${user_id} in ${channel_id}`)
  }

  async unbanUser(channel_id: number, user_id: number) {
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

  async checkChannelUser(channel_id: number, user_id: number) :Promise <boolean>   {
    const chatUser = await this.channelUserRepository
    .findOne({select: {user_id:true}, where: {channel_id, user_id}});
  //const chatUser = await this.channelUserRepository.findOne({where: {user_id, channel_id}});
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
    const channelUser = await this.channelUserRepository.findOne({where: {user_id, channel_id}});
    console.log(channelUser)
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

}