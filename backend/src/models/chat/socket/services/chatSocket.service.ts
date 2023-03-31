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
      const existingUser = await this.channelUserRepository
        .findOne({where: {channel_id: md.channel_id, user_id}});
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
        throw new InternalServerErrorException();
    }
  }

  async muteUser(muteDto: toggleDto) :Promise<ChannelMuteList> {
    const muteUser = this.muteRepository.create({
      user_id: muteDto.user_id,
      channel_id: muteDto.channel_id,
      end_at: muteDto.time_at
    });
    await this.muteRepository.save(muteUser);
    return muteUser;
  }

  async banUser(muteDto: toggleDto) :Promise<ChannelBanList> {
    const banUser = this.banRepository.create({
      user_id: muteDto.user_id,
      channel_id: muteDto.channel_id,
      end_at: muteDto.time_at
    });
    await this.muteRepository.save(banUser);
    return banUser;
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

  async checkChannelUser(channel_id: number, user_id: number) :Promise <boolean>   {
    const chatUser = await this.channelUserRepository.findOne({ where: {channel_id, user_id }});
    if (chatUser)
      return true;
    return false;
  }

  async checkAdminUser(channel_id: number, user_id: number) : Promise <boolean> {
    const channelUser = await this.channelUserRepository.findOne({where: {user_id, channel_id}});
    if (!channelUser || channelUser.role == ChannelUserRoles.USER)
      return false;
    return true;
  }

  //createChatRoom 대체
  // async addRoom(roomName: string, host: User): Promise<void> {
  //   const room = await this.getRoomByName(roomName);
  //   if (room === -1) {
  //     await this.rooms.push({ name: roomName, host, users: [host] });
  //   }
  // }

  // async removeRoom(roomName: string): Promise<void> {
  //   const findRoom = await this.getRoomByName(roomName);
  //   if (findRoom !== -1) {
  //     this.rooms = this.rooms.filter((room) => room.name !== roomName);
  //   }
  // }

  // async getRoomHost(hostName: string): Promise<User> {
  //   const roomIndex = await this.getRoomByName(hostName);
  //   return this.rooms[roomIndex].host;
  // }

  // async getRoomByName(roomName: string): Promise<number> {
  //   const roomIndex = this.rooms.findIndex((room) => room?.name === roomName);
  //   return roomIndex;
  // }

  // async addUserToRoom(roomName: string, user: User): Promise<void> {
  //   const roomIndex = await this.getRoomByName(roomName);
  //   if (roomIndex !== -1) {
  //     this.rooms[roomIndex].users.push(user);
  //     const host = await this.getRoomHost(roomName);
  //     if (host.userId === user.userId) {
  //       this.rooms[roomIndex].host.socketId = user.socketId;
  //     }
  //   } else {
  //     await this.addRoom(roomName, user);
  //   }
  // }

  // async findRoomsByUserSocketId(socketId: string): Promise<Room[]> {
  //   const filteredRooms = this.rooms.filter((room) => {
  //     const found = room.users.find((user) => user.socketId === socketId);
  //     if (found) {
  //       return found;
  //     }
  //   });
  //   return filteredRooms;
  // }

  // async removeUserFromAllRooms(socketId: string): Promise<void> {
  //   const rooms = await this.findRoomsByUserSocketId(socketId);
  //   for (const room of rooms) {
  //     await this.removeUserFromRoom(socketId, room.name);
  //   }
  // }

  // async removeUserFromRoom(socketId: string, roomName: string): Promise<void> {
  //   const room = await this.getRoomByName(roomName);
  //   this.rooms[room].users = this.rooms[room].users.filter(
  //     (user) => user.socketId !== socketId,
  //   );
  //   if (this.rooms[room].users.length === 0) {
  //     await this.removeRoom(roomName);
  //   }
  // }

  // async getRooms(): Promise<Room[]> {
  //   return this.rooms;
  // }
}