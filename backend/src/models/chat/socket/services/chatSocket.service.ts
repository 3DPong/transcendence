import { Injectable } from '@nestjs/common';
import {
  BanStatus,
  ChannelBanList,
  ChannelMuteList,
  ChannelType,
  ChannelUser,
  ChannelUserRoles,
  ChatChannel,
  DmChannel,
  MessageLog,
  MessageType,
  MuteStatus,
} from '../../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelInterface, messageInterface, toggleInterface, basicsInterface} from '../chat.interface';
import { Server, Socket } from 'socket.io';
import { SocketException } from '../../../../common/filters/socket/socket.filter';
import { RelationStatus } from 'src/common/enums/relationStatus.enum';
import { User, UserRelation } from 'src/models/user/entities';
import { SocketMapService } from 'src/providers/redis/socketMap.service';

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
    @InjectRepository(UserRelation)
    private relationRepository: Repository<UserRelation>,
    private readonly socketMapService: SocketMapService
  ) {}

  async joinAllChatRooms(socket: Socket, user_id: number) {
    const channelIds = await this.getAllUserChannel(user_id);
    channelIds.forEach((id) => {
      socket.join(`chat_alarm_${id}`);
    });
  }

  async getAllUserChannel(user_id: number) {
    try {
      const channelUsers: ChannelUser[] = await this.channelUserRepository.find({
        where: { user_id },
        select: {
          channel_id: true,
        },
      });
      const channelIds = channelUsers.map((user) => user.channel_id);

      const dmChannels: DmChannel[] = await this.dmRepository.find({
        where: [{ first_user_id: user_id }, { second_user_id: user_id }],
        select: {
          channel_id: true,
        },
      });
      dmChannels.map((dm) => channelIds.push(dm.channel_id));

      return channelIds;
    } catch (error) {
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  }

  async sendChatMessage(server: Server, user_id: number, md: messageInterface, socketIds: string[]) {
    if (!user_id) throw new SocketException('Forbidden', `권한이 없습니다!`);
    if (md.type === MessageType.MESSAGE && (md.message === null || md.message === '' || isWhitespace(md.message)))
      throw new SocketException('BadRequest', `내용을 입력 해 주세요!`);
    if (md.type === MessageType.MESSAGE && md.message.length >= 500)
      throw new SocketException('BadRequest', `내용은 500자 이내로 작성 해 주세요!`);

    let dmUser;
    const channel = await this.getChannel(md.channel_id);
    if (!channel) {
      throw new SocketException('NotFound', `채널을 찾을 수 없습니다!`);
    } else if (channel.type === ChannelType.DM && !(dmUser = await this.getDmUsers(md.channel_id, user_id))) {
      throw new SocketException('NotFound', `디엠 유저를 찾을 수 없습니다!`);
    } else if (channel.type === ChannelType.DM && (await this.checkBlocked(dmUser, user_id))) {
      throw new SocketException('Forbidden', `차단 상태 입니다!`);
    } else if (channel.type !== ChannelType.DM && !(await this.checkChannelUser(md.channel_id, user_id))) {
      throw new SocketException('NotFound', `채팅 유저를 찾을 수 없습니다!`);
    } else if (
      channel.type !== ChannelType.DM &&
      (await this.checkMuteUser(md.channel_id, user_id)) === MuteStatus.Mute
    ) {
      throw new SocketException('Forbidden', `뮤트 상태 입니다!`);
    }

    try {
      const newMessage = await this.createMessageLog(user_id, md);

      if (channel.type === ChannelType.DM) await this.updateDmUser(user_id, dmUser, channel, server);
      server.to(`chat_active_${md.channel_id}`).emit('chat', newMessage);
      server
        .to(`chat_alarm_${md.channel_id}`)
        .except(socketIds)
        .emit('alarm', { type: 'chat', channel_id: channel.channel_id }); //보류
    } catch (error) {
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  }

  async muteUser(server: Server, adminId: number, muteData: toggleInterface) {
    const { user_id, channel_id } = muteData;

    if (
      !adminId ||
      !(await this.checkAdminUser(channel_id, adminId)) ||
      !(await this.checkChannelUserRole(channel_id, user_id))
    )
      throw new SocketException('Forbidden', `권한이 없습니다!`);

    const muted = await this.checkMuteUser(channel_id, user_id);
    if (muted === MuteStatus.Mute) {
      await this.unmuteUser(channel_id, user_id);
      server.to(`chat_active_${channel_id}`).emit('mute', { type: 'unmute', user_id: user_id, channel_id: channel_id });
    } else {
      if (muteData.end_at === null) throw new SocketException('BadRequest', `뮤트 해제 시간을 추가하세요!`);
      try {
        if (muted === MuteStatus.PassedMute) await this.updateMuteUser(muteData);
        else if (muted === MuteStatus.NoneMute) await this.createMuteUser(muteData);

        server
          .to(`chat_active_${channel_id}`)
          .emit('mute', { type: 'mute', user_id: user_id, channel_id: channel_id, end_at: `${muteData.end_at}` });
      } catch (error) {
        throw new SocketException('InternalServerError', `${error.message}`);
      }
    }
  }

  async banUser(server: Server, adminId: number, banData: toggleInterface, banUserSocket: string) {
    const { user_id, channel_id } = banData;

    if (
      !adminId ||
      !(await this.checkAdminUser(channel_id, adminId)) ||
      !(await this.checkChannelUserRole(channel_id, user_id))
    )
      throw new SocketException('Forbidden', `권한이 없습니다!`);

    const banned = await this.checkBanUser(channel_id, user_id);

    if (banned === BanStatus.Ban) {
      throw new SocketException('Forbidden', `이미 밴 상태입니다!`);
    } else {
      if (banData.end_at === null) throw new SocketException('BadRequest', `밴 해제 시간을 추가하세요!`);

      try {
        if (banned === BanStatus.PassedBan) await this.updateBanUser(banData);
        else if (banned === BanStatus.NoneBan) await this.createBanUser(banData);

        await this.deleteChannelUser(channel_id, user_id);

        if (banUserSocket) {
          server.in(banUserSocket).socketsLeave(`chat_alarm_${channel_id}`);
          const title = await this.getChannelName(channel_id);
          server
            .in(banUserSocket)
            .emit('alarm', { type: 'ban', channel_id: channel_id, message: `${title} 에서 밴 되었습니다.` }); //당사자
        }
        server
          .to(`chat_active_${channel_id}`)
          .except(banUserSocket)
          .emit('ban', { type: 'ban', user_id: user_id, channel_id: channel_id, end_at: `${banData.end_at}` }); //일반 유저들
      } catch (error) {
        throw new SocketException('InternalServerError', `${error.message}`);
      }
    }
  }

  async unBanUser(server: Server, adminId: number, unbanData: basicsInterface) {
    const { user_id, channel_id } = unbanData;

    if (!adminId || !(await this.checkAdminUser(channel_id, adminId)))
      throw new SocketException('Forbidden', `권한이 없습니다!`);

    const banned = await this.checkBanUser(channel_id, user_id);
    if (banned === BanStatus.Ban) {
      await this.releaseBanUser(channel_id, user_id);
      server.to(`chat_active_${channel_id}`).emit('ban', { type: 'unban', user_id: user_id, channel_id: channel_id }); //일반 유저들
    } else {
      throw new SocketException('BadRequest', `밴 유저가 아닙니다!`);
    }
  }

  async kickUser(server: Server, adminId: number, kickData: basicsInterface, userSocket: string) {
    const { user_id, channel_id } = kickData;

    if (
      !adminId ||
      !(await this.checkAdminUser(channel_id, adminId)) ||
      !(await this.checkChannelUserRole(channel_id, user_id))
    )
      throw new SocketException('Forbidden', `권한이 없습니다!`);

    try {
      await this.deleteChannelUser(channel_id, user_id);

      if (userSocket) {
        server.in(userSocket).socketsLeave(`chat_alarm_${channel_id}`);
        const title = await this.getChannelName(channel_id);
        server
          .in(userSocket)
          .emit('alarm', { type: 'kick', channel_id: channel_id, message: `${title} 에서 강제 퇴장 되었습니다.` }); //당사자
      }

      server.to(`chat_active_${channel_id}`).emit(`kick`, { user_id: user_id, channel_id: channel_id }); //일반유저
    } catch (error) {
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  }

  async createMessageLog(user_id: number, md: messageInterface): Promise<MessageLog> {
    const newLog = this.messageLogRepository.create({
      channel_id: md.channel_id,
      user_id,
      content: md.message,
      type: md.type,
    });
    await this.messageLogRepository.save(newLog);
    return newLog;
  }

  async updateDmUser(user_id: number, dmChannel: DmChannel, channel: ChatChannel, server: Server) {
    const { first_status, second_status } = dmChannel;

    if (first_status === false || second_status === false) {
      await this.dmRepository.update(
        {
          first_user_id: dmChannel.first_user.user_id,
          second_user_id: dmChannel.second_user.user_id,
        },
        {
          first_status: true,
          second_status: true,
        }
      );

      if (first_status === false) {
        const userSocket = await this.getSocketIdByUserId(dmChannel.first_user.user_id);
        if (userSocket) {
          server.in(userSocket).socketsJoin(`chat_alarm_${channel.channel_id}`);
          if (dmChannel.first_user.user_id !== user_id) {
            server.in(userSocket).emit('alarm', {
              type: 'invite',
              message: this.channelResult(channel, dmChannel.second_user),
            });
          }
        }
      }

      if (second_status === false) {
        const userSocket = await this.getSocketIdByUserId(dmChannel.second_user.user_id);
        if (userSocket) {
          server.in(userSocket).socketsJoin(`chat_alarm_${channel.channel_id}`);
          if (dmChannel.second_user.user_id !== user_id) {
            server.in(userSocket).emit('alarm', {
              type: 'invite',
              message: this.channelResult(channel, dmChannel.first_user),
            });
          }
        }
      }
    }
  }

  async createMuteUser(muteData: toggleInterface): Promise<ChannelMuteList> {
    const muteUser = this.muteRepository.create({
      user_id: muteData.user_id,
      channel_id: muteData.channel_id,
      end_at: muteData.end_at,
    });
    await this.muteRepository.save(muteUser);
    return muteUser;
  }

  async updateMuteUser(muteData: toggleInterface) {
    await this.muteRepository.update(
      {
        user_id: muteData.user_id,
        channel_id: muteData.channel_id,
      },
      { end_at: muteData.end_at }
    );
  }

  async createBanUser(banData: toggleInterface): Promise<ChannelBanList> {
    const banUser = this.banRepository.create({
      user_id: banData.user_id,
      channel_id: banData.channel_id,
      end_at: banData.end_at,
    });
    await this.banRepository.save(banUser);
    return banUser;
  }

  async updateBanUser(banData: toggleInterface) {
    await this.banRepository.update(
      {
        user_id: banData.user_id,
        channel_id: banData.channel_id,
      },
      { end_at: banData.end_at }
    );
  }

  async deleteChannelUser(channel_id: number, user_id: number) {
    return await this.channelUserRepository.softDelete({ channel_id, user_id });
  }

  async unmuteUser(channel_id: number, user_id: number) {
    const result = await this.muteRepository.delete({ channel_id, user_id });
    if (result.affected === 0) throw new SocketException('NotFound', `유저를 찾을 수 없습니다!`);
  }

  async releaseBanUser(channel_id: number, user_id: number) {
    const result = await this.banRepository.delete({ channel_id, user_id });
    if (result.affected === 0) throw new SocketException('NotFound', `유저를 찾을 수 없습니다!`);
  }

  async checkMuteUser(channel_id: number, user_id: number): Promise<MuteStatus> {
    const muted = await this.muteRepository.findOne({ where: { channel_id, user_id } });
    if (muted) {
      const time = new Date();
      if (muted.end_at > time) return MuteStatus.Mute;

      return MuteStatus.PassedMute;
    }
    return MuteStatus.NoneMute;
  }

  async checkBanUser(channel_id: number, user_id: number): Promise<BanStatus> {
    const banned = await this.banRepository.findOne({ where: { channel_id, user_id } });
    if (banned) {
      const time = new Date();
      if (banned.end_at > time) return BanStatus.Ban;

      return BanStatus.PassedBan;
    }
    return BanStatus.NoneBan;
  }

  async checkBlocked(dm: DmChannel, target_id: number): Promise<boolean> {
    let user_id;
    if (dm.first_user.user_id == target_id) {
      user_id = dm.second_user.user_id;
    } else {
      user_id = dm.first_user.user_id;
    }

    const relation = await this.relationRepository.findOne({
      where: {
        user_id,
        target_id,
        status: RelationStatus.BLOCK,
      },
    });
    return !!relation;
  }

  async checkChannelUser(channel_id: number, user_id: number): Promise<boolean> {
    const chatUser = await this.channelUserRepository.findOne({
      where: {
        channel_id,
        user_id,
      },
      select: {
        channel_id: true,
        user_id: true,
      },
    });
    return !!chatUser;
  }

  async checkChannelUserRole(channel_id: number, user_id: number): Promise<boolean> {
    const chatUser = await this.channelUserRepository.findOne({
      where: {
        channel_id,
        user_id,
        role: ChannelUserRoles.USER,
      },
      select: {
        channel_id: true,
        user_id: true,
        role: true,
      },
    });
    return !!chatUser;
  }

  async checkAdminUser(channel_id: number, user_id: number): Promise<boolean> {
    const channelUser = await this.channelUserRepository.findOne({
      where: {
        channel_id,
        user_id,
      },
      select: {
        channel_id: true,
        user_id: true,
        role: true,
      },
    });
    return !(!channelUser || channelUser.role === ChannelUserRoles.USER);
  }

  async getChannelUserName(channel_id: number, user_id: number): Promise<string> {
    const chatUser = await this.channelUserRepository.findOne({ where: { channel_id, user_id } });
    if (chatUser) return chatUser.user.nickname;
    return null;
  }

  async getDmUser(channel_id: number, user_id: number): Promise<DmChannel> {
    const dmChannel = await this.dmRepository.findOne({ where: { channel_id } });
    if (dmChannel.first_user_id !== user_id && dmChannel.second_user_id !== user_id) return null;
    return dmChannel;
  }

  async getDmUsers(channel_id: number, user_id: number) {
    let dmChannel = await this.dmRepository
      .createQueryBuilder('dm')
      .innerJoin('dm.first_user', 'first')
      .innerJoin('dm.second_user', 'second')
      .select([
        'first.user_id',
        'first.nickname',
        'first.profile_url',
        'dm.first_status',
        'second.user_id',
        'second.nickname',
        'second.profile_url',
        'dm.second_status',
      ])
      .where('dm.channel_id = :channel_id', { channel_id })
      .getRawOne();

    if (dmChannel.first_user_id !== user_id && dmChannel.second_user_id !== user_id) return null;

    return {
      first_status: dmChannel.dm_first_status,
      first_user: {
        user_id: dmChannel.first_user_id,
        nickname: dmChannel.first_nickname,
        profile_url: dmChannel.first_profile_url,
      },
      second_status: dmChannel.dm_second_status,
      second_user: {
        user_id: dmChannel.second_user_id,
        nickname: dmChannel.second_nickname,
        profile_url: dmChannel.second_profile_url,
      },
    };
  }

  async getChannel(channel_id: number): Promise<ChatChannel> {
    const channel = await this.channelRepository.findOne({
      select: { channel_id: true, name: true, type: true, thumbnail_url: true },
      where: { channel_id },
    });
    if (!channel) return null;
    return channel;
  }

  async getChannelName(channel_id: number): Promise<string> {
    const channel = await this.channelRepository.findOne({ select: { name: true }, where: { channel_id } });
    if (!channel) return null;
    return channel.name;
  }

  async getSocketIdByUserId(userId: number) {
    const socketMap = await this.socketMapService.getUserSockets(userId);
    if (socketMap !== null) return socketMap.chat;
    return null;
  }

  channelResult(channel: ChatChannel, second_user: User): ChannelInterface {
    return {
      channel_id: channel.channel_id,
      name: channel.name,
      type: channel.type,
      thumbnail_url: channel.thumbnail_url,
      owner: {
        user_id: second_user.user_id,
        nickname: second_user.nickname,
        profile_url: second_user.profile_url,
      },
    };
  }
}

function isWhitespace(value: string): boolean {
  const pattern = /^\s*$/;
  return pattern.test(value);
}
