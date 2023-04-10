import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseFilters} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatSocketService } from './services/chatSocket.service';
import { ChannelIdDto, MessageDto, toggleDto, toggleTimeDto } from '../dto/socket.dto';
import { ChannelType, ChannelUser, ChannelUserRoles, ChatChannel } from '../entities';
import {SocketException, SocketExceptionFilter} from './socket.filter';
import { UpdateResult } from 'typeorm';


@UseFilters(new SocketExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatSocketService: ChatSocketService) {}

  @WebSocketServer()
  server: Server;
  private users: { userId: number; socketId: string }[] = [];
  private activeRooms: {userId: number; channelId: number}[] = [];
  private logger = new Logger('ChatGateway');
  

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
    } catch (error) {
      socket.disconnect();
    }
  }


  async handleDisconnect(@ConnectedSocket() socket: Socket): Promise<void> {
    const { user_id } = socket.data.user
    const userIndex = this.users.findIndex((u) => u.userId.toString() === user_id);
    if (userIndex >= 0) {
      this.users.splice(userIndex, 1);
    }
    this.logger.log(`Socket disconnected: ${user_id}`);
  }

  @SubscribeMessage('join')
  async handleSetClientEvent(@ConnectedSocket() socket: Socket){

    const userId = this.getUserIdBySocketId(socket.id);
    return this.chatSocketService.joinAllChatRooms(socket, userId);
  }

  @SubscribeMessage('enter-chat')
  async handleEnterRoom(@ConnectedSocket() socket: Socket, @MessageBody() dto : ChannelIdDto){

    const userId = this.getUserIdBySocketId(socket.id);
    // const userIndex = this.activeRooms.findIndex((u) => u.userId=== userId);
    // if (userIndex >= 0) {
    //     //error or 바꾸기
    //     // this.server.in(this.activeRooms[userIndex].socketId).disconnectSockets();
    //     //this.handleLeaveRoom(socket, dto);
    //     this.activeRooms[userIndex].channelId =  dto.channel_id;
    // } else {
    //   this.activeRooms.push({ userId: userId, channelId: dto.channel_id });
    // }

    return this.chatSocketService.enterChatRoom(socket, dto.channel_id, userId);
  }
  
  @SubscribeMessage('leave-chat')
  async handleLeaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() dto : ChannelIdDto) {

    const userId = this.getUserIdBySocketId(socket.id);
    return this.chatSocketService.leaveChatRoom(socket, dto.channel_id, userId);
  }

  // @SubscribeMessage('update-chat')
  // async handleUpdateRoom(@ConnectedSocket() socket: Socket, @MessageBody() dto : ChannelIdDto) {

  //   const userId = this.getUserIdBySocketId(socket.id);
  //   return this.chatSocketService.leaveChatRoom(socket, dto.channel_id, userId);
  // }

  @SubscribeMessage('message-chat')
  async handleChatEvent(@ConnectedSocket() socket: Socket, @MessageBody() md: MessageDto) {

    const userId = this.getUserIdBySocketId(socket.id);
    return this.chatSocketService.sendChatMessage(this.server, userId, md);
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

  handleJoinUsers(userIds: number[], channel_id:number, channel: ChatChannel) {

    if (userIds !== null) {
      for (const userId of userIds) {
        const userSocket = this.getSocketIdByUserId(userId);
        if (userSocket) {
          if (!this.server.sockets.adapter.socketRooms(userSocket).has(`chat_${channel_id}`)) {
            this.server.in(userSocket).socketsJoin(`chat_${channel_id}`);
            this.server.in(userSocket).emit('alarm', {type:'invite', message: channel});
          } 
        }   
      }
    }
  }

  async handleLeaveUser(user_id: number, channel_id:number, userNickname: string) {
    const userSocket = this.getSocketIdByUserId(user_id);
    if (userSocket) {
      if (this.server.sockets.adapter.socketRooms(userSocket).has(`chat_${channel_id}`)) {
        this.server.in(userSocket).socketsLeave(`chat_${channel_id}`);
      } 
    }
    this.server.to(`chat_${channel_id}`).except(userSocket)
      .emit('alarm', {type: 'leave', user_id: user_id, channel_id: channel_id,  message: `${userNickname} 가 나갔습니다.`});
  }

  hanndleAdminRoleUpdate(user_id: number, channel_id:number,  changedRole: ChannelUserRoles) {
    const userSocket = this.getSocketIdByUserId(user_id);
    this.server.to(`chat_${channel_id}`).except(userSocket)
      .emit('alarm', {type: 'update', user_id: user_id, channel_id:channel_id, message: changedRole});
  }

  // hanndleCreateChat(user_id: number, channel_id:number) {
  //   const userSocket = this.getSocketIdByUserId(user_id);
  //   return this.chatSocketService.hanndleCreateChat(userSocket, channel_id);
  // }



  getSocketIdByUserId(userId: number) {
    return this.users.find((u) => u.userId === userId)?.socketId;
  }

  getUserIdBySocketId(socketId: string) {
    return this.users.find((u) => u.socketId === socketId)?.userId;
  } 

}