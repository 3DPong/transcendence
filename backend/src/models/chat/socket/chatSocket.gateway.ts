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
import { ChannelIdDto, MessageDto, toggleDto, toggleTimeDto } from '../dto/socket.dto';
import { ChannelUser, ChannelUserRoles, ChatChannel } from '../entities';
import { SocketException, SocketExceptionFilter } from '../../../common/filters/socket/socket.filter';


@UseFilters(new SocketExceptionFilter())
@WebSocketGateway({
  namespace : 'chat',
})
export class ChatSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private users: { userId: number; socketId: string }[] = [];
  private activeRooms: { userId: number; channelId: number }[] = [];
  private logger = new Logger('ChatGateway');

  constructor(private chatSocketService: ChatSocketService) {}

  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    const { user_id } = socket.handshake.query;
    socket.data.user = user_id as string;

    try {
      const userIndex = this.users.findIndex((u) => u.userId.toString() === user_id);
      if (userIndex >= 0) {
        this.server.in(this.users[userIndex].socketId).disconnectSockets();
        this.users[userIndex].socketId = socket.id;
      } else {
        this.users.push({ userId: parseInt(user_id as string), socketId: socket.id });
      }
      this.logger.log(`Socket connected: ${user_id}'s ${socket.id}`);
      this.chatSocketService.joinAllChatRooms(socket, socket.data.user);
    } catch (error) {
      socket.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket): Promise<void> {
    const { user_id } = socket.data.user;

    const userIndex = this.users.findIndex((u) => u.userId.toString() === user_id);
    if (userIndex >= 0) this.users.splice(userIndex, 1);

    const activeIndex = this.activeRooms.findIndex((u) => u.userId.toString() === user_id);
    if (activeIndex >= 0) this.activeRooms.splice(activeIndex, 1);

    this.logger.log(`Socket disconnected: ${user_id}`);
  }

  @SubscribeMessage('join')
  async handleSetClientEvent(@ConnectedSocket() socket: Socket) {
    const userId = this.getUserIdBySocketId(socket.id);
    return this.chatSocketService.joinAllChatRooms(socket, userId);
  }
  
  @SubscribeMessage('enter-chat')
  async handleEnterRoom(@ConnectedSocket() socket: Socket, @MessageBody() dto: ChannelIdDto) {
    const userId = this.getUserIdBySocketId(socket.id);
    if (!userId) throw new SocketException('Forbidden', `권한이 없습니다!`);
 
    const userIndex = this.activeRooms.findIndex((u) => u.userId === userId);
    if (userIndex >= 0) this.activeRooms[userIndex].channelId =  dto.channel_id;
    else this.activeRooms.push({ userId: userId, channelId: dto.channel_id });
    socket.join(`chat_active_${dto.channel_id}`);

  }

  @SubscribeMessage('leave-chat')
  async handleLeaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() dto: ChannelIdDto) {
    const userId = this.getUserIdBySocketId(socket.id);
    if (!userId) throw new SocketException('Forbidden', `권한이 없습니다!`);

    const userIndex = this.activeRooms.findIndex((u) => u.userId === userId && u.channelId === dto.channel_id);
    if (userIndex >= 0) {
      this.activeRooms.splice(userIndex, 1);
      socket.leave(`chat_active_${dto.channel_id}`);
    }
  }
 
  @SubscribeMessage('message-chat')
  async handleChatEvent(@ConnectedSocket() socket: Socket, @MessageBody() md: MessageDto) {
    const userId = this.getUserIdBySocketId(socket.id);
    const socketIds = this.getActiveChannelUsersSocketIds(md.channel_id);
    return this.chatSocketService.sendChatMessage(this.server, userId, md, socketIds);
  }

  @SubscribeMessage('mute-chat')
  async muteChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() muteDto: toggleTimeDto) {
    const adminId = this.getUserIdBySocketId(socket.id);
    return this.chatSocketService.muteUser(this.server, adminId, muteDto);
  }

  @SubscribeMessage('ban-chat')
  async banChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() banDto: toggleTimeDto) {
    const adminId = this.getUserIdBySocketId(socket.id);
    const userSocket = this.getSocketIdByUserId(banDto.user_id);
    return this.chatSocketService.banUser(this.server, adminId, banDto, userSocket);
  }

  @SubscribeMessage('unban-chat')
  async unbanChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() unbanDto: toggleDto) {
    const adminId = this.getUserIdBySocketId(socket.id);
    return this.chatSocketService.unBanUser(this.server, adminId, unbanDto);
  }

  @SubscribeMessage('kick-chat')
  async kickChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() kickDto: toggleDto) {
    const adminId = this.getUserIdBySocketId(socket.id);
    const userSocket = this.getSocketIdByUserId(kickDto.user_id);
    return this.chatSocketService.kickUser(this.server, adminId, kickDto, userSocket);
  }


  /*
      Func From Api Reqeust
  */
  handleEmitRoom(channel_id: number, user: ChannelUser[]) {
    this.server.to(`chat_active_${channel_id}`).emit('user', {
      type: 'join',
      user 
    });
  }

  handleJoinUsers(userIds: number[], owner_id: number, channel_id: number, channel: ChatChannel) {
 
    if (userIds !== null) {
      for (const userId of userIds) {
        const userSocket = this.getSocketIdByUserId(userId);
        if (userSocket) {
          this.server.in(userSocket).socketsJoin(`chat_alarm_${channel_id}`);
          if (userId !== owner_id)
            this.server.in(userSocket).emit('alarm', { type: 'invite', message: channel });
        }
      }
      // this.server.to(`chat_alarm_${channel_id}`).except(this.getSocketIdByUserId(owner_id))
      //   .emit('alarm', { type: 'invite', message: channel });
    }
  }

  handleLeaveUser(channel_id: number, user_id: number) {
    const userSocket = this.getSocketIdByUserId(user_id);
    if (userSocket) {
      this.server.in(userSocket).socketsLeave(`chat_alarm_${channel_id}`);
      this.server.in(userSocket).socketsLeave(`chat_active_${channel_id}`);

      // if (this.server.sockets.adapter.socketRooms(userSocket).has(`chat_${channel_id}`)) {
      //   this.server.in(userSocket).socketsLeave(`chat_${channel_id}`);
      // }
    }

    this.server.to(`chat_active_${channel_id}`).emit('user', {
      type: 'leave',
      user_id
    });
  }

  handleAdminRoleUpdate(user_id: number, channel_id: number, changedRole: ChannelUserRoles) {
    const userSocket = this.getSocketIdByUserId(user_id);
    this.server
      .to(`chat_active_${channel_id}`)
      .emit('role', { type: changedRole, user_id: user_id });
    
    //   if (changedRole === ChannelUserRoles.OWNER) {
    //  //getChannelUserName(user_id)
    //     this.server
    //     .to(`chat_alarm_${channel_id}`)
    //     .emit('alarm', { type: ChannelUserRoles.OWNER, channel_id: channel_id, user_id: user_id });
    // }
  }

   /*
      Func for private instance
  */
  getSocketIdByUserId(userId: number) {
    return this.users.find((u) => u.userId === userId)?.socketId;
  }

  getUserIdBySocketId(socketId: string) {
    return this.users.find((u) => u.socketId === socketId)?.userId;
  }

  getActiveChannelUsersSocketIds(channel_id: number): string[]{
    const userIds = this.activeRooms
      .filter(room => room.channelId === channel_id).map(room => room.userId);
      
    const socketIds = this.users
      .filter(user => userIds.includes(user.userId))
      .map(user => user.socketId.toString());

    return socketIds;
  }

}
