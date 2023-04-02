import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChannelBanList, ChannelMuteList, ChannelUser, ChannelUserRoles, DmChannel, MessageLog } from '../../entities';
import { ChatChannel } from '../../entities/chatChannel.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageDto, toggleDto } from '../../dto/create-channel.dto';


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

  async createMessageLog(user_id: number, md: MessageDto) :Promise<MessageLog> {
    try {
      console.log("start create!!!!!!!!!!");
      const existingUser = await this.channelUserRepository
        .find({select: {user_id:true}, where: {channel_id: md.channel_id, user_id}});
      if (!existingUser)
        throw new NotFoundException(`can't find ${ md.channel_id}'s user ${user_id}`);
      
      if (await this.checkMuteUser(md.channel_id, user_id))
        throw new UnauthorizedException('muted User!');

    
      const newLog = this.messageLogRepository.create({
        channel_id: md.channel_id,
        user_id,
        content: md.message
      });
      await this.messageLogRepository.save(newLog);
      return newLog;
      } catch (error) {
        console.log("\n\n22error\n\n")
        console.log(error)
        throw new InternalServerErrorException();
    }
  }

  async muteUser(muteDto: toggleDto) :Promise<ChannelMuteList> {
    const muteUser = this.muteRepository.create({
      user_id: muteDto.user_id,
      channel_id: muteDto.channel_id
    });
    await this.muteRepository.save(muteUser);
    return muteUser;
  }

  async banUser(muteDto: toggleDto) :Promise<ChannelBanList> {
    const banUser = this.banRepository.create({
      user_id: muteDto.user_id,
      channel_id: muteDto.channel_id
    });
    await this.muteRepository.save(banUser);
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
    const muted = await this.banRepository.findOne({where: {channel_id, user_id}});
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

  const chatUser = await this.channelUserRepository.findOne({where: {user_id, channel_id}});
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
    if (!channelUser || channelUser.role === ChannelUserRoles.USER)
      return false;
    return true;
  }

}