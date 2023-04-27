import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatSocketService } from './services';
import { ChannelInterface, idInterface, messageInterface, basicsInterface, toggleInterface } from './chat.interface';
import { ChannelType, ChannelUser, ChannelUserRoles } from '../entities';
import { SocketException, SocketExceptionFilter } from '../../../common/filters/socket/socket.filter';
import { JwtService } from '@nestjs/jwt';
import { TokenStatusEnum } from 'src/common/enums/tokenStatusEnum';
import { SocketMapService } from 'src/providers/redis/socketMap.service';


@UseFilters(new SocketExceptionFilter())
@WebSocketGateway({
  namespace: 'chat',
})
export class ChatSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeRooms: { userId: number; channelId: number }[] = [];
  private logger = new Logger('ChatGateway');

  constructor(
    private readonly socketMapService: SocketMapService,
    private chatSocketService: ChatSocketService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    try {
      const cookie = socket.handshake.headers.cookie;
      if (!cookie) throw new Error('cookie is invalid');
      const token = cookie
        .split(';')
        .find((c) => c.trim().startsWith('Authentication='))
        .split('=')[1]
        .trim();
      if (!token) throw new Error('token is required');
      const decoded = this.jwtService.verify(token);
      if (!decoded || !decoded.user_id || decoded.status !== TokenStatusEnum.SUCCESS)
        throw new Error('token is invalid');
      const { user_id } = decoded;
      socket.data.user = user_id.toString();
      if (await this.isOnline(user_id, socket.id)) throw new Error('already online');

      await this.socketMapService.setUserSocket(user_id, 'chat', socket.id);
      await this.chatSocketService.joinAllChatRooms(socket, socket.data.user);
      this.logger.log(`Socket connected: ${user_id}'s ${socket.id}`);
    } catch (error) {
      this.logger.error(`${error} on connecting`);
      socket.disconnect();
      this.logger.log(`Socket disconnect: ${socket.id} ` + error);
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket): Promise<void> {
    const user_id = socket.data.user;
    if (await this.isOnline(user_id, socket.id)) {
      this.logger.log(`Duplicate user ${user_id} disconnect with socket id: ${socket.id}`);
      return;
    }
    await this.socketMapService.deleteUserSocket(user_id, 'chat');
    const activeIndex = this.activeRooms.findIndex((u) => u.userId.toString() === user_id);
    if (activeIndex >= 0) this.activeRooms.splice(activeIndex, 1);

    this.logger.log(`Socket disconnected: ${user_id}`);
  }

  @SubscribeMessage('enter-chat')
  async handleEnterRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: idInterface) {
    const userId = await this.getUserIdBySocketId(socket.id);
    if (!userId) throw new SocketException('Forbidden', `권한이 없습니다!`);

    const userIndex = this.activeRooms.findIndex((u) => u.userId === parseInt(userId));
    if (userIndex >= 0) {
      socket.leave(`chat_active_${this.activeRooms[userIndex].channelId}`);
      this.activeRooms[userIndex].channelId = data.channel_id;
    } else {
      this.activeRooms.push({ userId: parseInt(userId), channelId: data.channel_id });
    }
    socket.join(`chat_active_${data.channel_id}`);
  }

  @SubscribeMessage('leave-chat')
  async handleLeaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: idInterface) {
    const userId = await this.getUserIdBySocketId(socket.id);
    if (!userId) throw new SocketException('Forbidden', `권한이 없습니다!`);

    const userIndex = this.activeRooms.findIndex(
      (u) => u.userId === parseInt(userId) && u.channelId === data.channel_id
    );
    if (userIndex >= 0) {
      this.activeRooms.splice(userIndex, 1);
      socket.leave(`chat_active_${data.channel_id}`);
    }
  }

  @SubscribeMessage('message-chat')
  async handleChatEvent(@ConnectedSocket() socket: Socket, @MessageBody() data: messageInterface) {
    const userId = await this.getUserIdBySocketId(socket.id);
    const socketIds = await this.getActiveChannelUsersSocketIds(data.channel_id);
    return this.chatSocketService.sendChatMessage(this.server, parseInt(userId), data, socketIds);
  }

  @SubscribeMessage('mute-chat')
  async muteChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() muteData: toggleInterface) {
    const adminId = await this.getUserIdBySocketId(socket.id);
    return this.chatSocketService.muteUser(this.server, parseInt(adminId), muteData);
  }

  @SubscribeMessage('ban-chat')
  async banChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() banData: toggleInterface) {
    const adminId = await this.getUserIdBySocketId(socket.id);
    const userSocket = await this.getSocketIdByUserId(banData.user_id);
    return this.chatSocketService.banUser(this.server, parseInt(adminId), banData, userSocket);
  }

  @SubscribeMessage('unban-chat')
  async unbanChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() unbanData: basicsInterface) {
    const adminId = await this.getUserIdBySocketId(socket.id);
    return this.chatSocketService.unBanUser(this.server, parseInt(adminId), unbanData);
  }

  @SubscribeMessage('kick-chat')
  async kickChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() kickData: basicsInterface) {
    const adminId = await this.getUserIdBySocketId(socket.id);
    const userSocket = await this.getSocketIdByUserId(kickData.user_id);
    return this.chatSocketService.kickUser(this.server, parseInt(adminId), kickData, userSocket);
  }

  /*
      Func From Api Request
  */
  handleEmitRoom(channel_id: number, user: ChannelUser[]) {
    this.server.to(`chat_active_${channel_id}`).emit('user', {
      type: 'join',
      user,
    });
  }

  async handleJoinUsers(userIds: number[], owner_id: number, channel_id: number, channel: ChannelInterface) {
    if (userIds !== null) {
      for (const userId of userIds) {
        const userSocket = await this.getSocketIdByUserId(userId);
        if (userSocket) {
          this.server.in(userSocket).socketsJoin(`chat_alarm_${channel_id}`);
          if (userId !== owner_id) this.server.in(userSocket).emit('alarm', { type: 'invite', message: channel });
        }
      }
    }
  }

  async handleLeaveUser(channel_id: number, user_id: number, type: ChannelType) {
    const userSocket = await this.getSocketIdByUserId(user_id);
    if (userSocket) {
      this.server.in(userSocket).socketsLeave(`chat_alarm_${channel_id}`);
      // this.server.in(userSocket).socketsLeave(`chat_active_${channel_id}`); //leave-chat 을 호출한다면 굳이 필요하진 않다
    }
    if (type !== ChannelType.DM) {
      this.server.to(`chat_active_${channel_id}`).emit('user', {
        type: 'leave',
        user_id,
      });
    }
  }

  handleAdminRoleUpdate(user_id: number, channel_id: number, changedRole: ChannelUserRoles) {
    this.server.to(`chat_active_${channel_id}`).emit('role', { type: changedRole, user_id: user_id });
  }

  async handleDmJoinUser(first_user_id: number, channel_id: number) {
    const userSocket = await this.getSocketIdByUserId(first_user_id);
    if (userSocket) {
      this.server.in(userSocket).socketsJoin(`chat_alarm_${channel_id}`);
      // if (userId !== owner_id)
      //   this.server.in(userSocket).emit('alarm', { type: 'invite', message: channel });
    }
  }

  /*
      Func for private instance
  */
  async getSocketIdByUserId(userId: number) {
    const socketMap = await this.socketMapService.getUserSockets(userId);
    if (socketMap === null) return null;
    return socketMap.chat;
  }

  async getUserIdBySocketId(socketId: string) {
    return await this.socketMapService.getSocketUser(socketId);
  }

  async getActiveChannelUsersSocketIds(channel_id: number): Promise<string[]> {
    const userIds = this.activeRooms.filter((room) => room.channelId === channel_id).map((room) => room.userId);
    const socketIds = [];
    for (const user of userIds) {
      const sockets = await this.socketMapService.getUserSockets(+user);
      if (sockets !== null) socketIds.push(sockets.chat);
    }
    return socketIds;
  }

  async isOnline(userId: number, socketId: string): Promise<boolean> {
    // check user is online in db and sockets
    const sockets = await this.socketMapService.getUserSockets(userId);
    // offline case
    if (!sockets || !sockets.chat) return false;
    // 동일 소켓 접속 케이스는 무시
    return sockets.chat !== socketId;
  }
}
