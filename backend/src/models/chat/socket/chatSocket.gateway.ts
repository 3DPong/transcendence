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
import { ChannelType } from '../entities';
import {SocketException, SocketExceptionFilter} from './socket.filter';


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

  @SubscribeMessage('enter-chat')
  async handleSetClientDataEvent(@ConnectedSocket() socket: Socket, @MessageBody() dto : ChannelIdDto){

    const userId = this.getUserIdBySocketId(socket.id);
    return this.chatSocketService.enterChatRoom(socket, dto.channel_id, userId);
  }
  
  @SubscribeMessage('leave-chat')
  async handleLeaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() dto : ChannelIdDto) {

    const userId = this.getUserIdBySocketId(socket.id);
    return this.chatSocketService.leaveChatRoom(socket, dto.channel_id, userId);
  }

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



  // handleJoinUser(user_id: number, channel_id:number) {
  //   const userSocket = this.getSocketIdByUserId(user_id);
  //   if (userSocket) {
  //     if (!this.server.sockets.adapter.socketRooms(userSocket).has(`chat_${channel_id}`)) {
  //       this.server.in(userSocket).socketsJoin(`chat_${channel_id}`);
  //     } 
  //   }
  // }

  // handleLeaveUser(user_id: number, channel_id:number) {
  //   const userSocket = this.getSocketIdByUserId(user_id);
  //   if (userSocket) {
  //     if (this.server.sockets.adapter.socketRooms(userSocket).has(`chat_${channel_id}`)) {
  //       this.server.in(userSocket).socketsLeave(`chat_${channel_id}`);
  //     } 
  //   }
  // }

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