import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatSocketService } from './services/chatSocket.service';
import { ChannelIdDto, MessageDto, toggleDto } from '../dto/create-channel.dto';
import { WsException } from '@nestjs/websockets';

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

  //= new Server<ServerToClientEvents, ClientToServerEvents>();
  

  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    const { user_id, channel_id } = socket.handshake.query; //string | string[] 으로 들어옴
    socket.data.user = user_id as string;
    socket.data.channel = channel_id as string;
    try {
      const userIndex = this.users.findIndex((u) => u.userId.toString() === user_id);
      if (userIndex >= 0) {
          this.server.in(this.users[userIndex].socketId).disconnectSockets();
          this.users[userIndex].socketId = socket.id;
      } else {
        this.users.push({ userId: parseInt(user_id as string), socketId: socket.id });
      }
      // socket.join(`chat_${channel_id}`);
      // socket.broadcast
      //  .to(`chat_${channel_id}`)
      //  .emit('message', { message: `${user_id} 유저가 들어왔습니다.` });
      // this.logger.log(`Socket connected: ${socket.id}`);
   
    } catch (error) {
      socket.disconnect();
      throw new WsException(error);
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket): Promise<void> {
    //await this.chatSocketService.removeUserFromAllRooms(socket.id);
    const { user_id, channel_id } = socket.data
    try {
      const userIndex = this.users.findIndex((u) => u.userId.toString() === user_id);
      if (userIndex >= 0) {
        this.users.splice(userIndex, 1);
      }
    
      // this.server
      // .to(`chat_${channel_id}`)
      // .emit('message', { message: `${socket.id}가 나갔습니다.` });
      // socket.leave(`chat_${channel_id}`); // leave room

      // socket.broadcast
      // .to(`chat_${channel_id}`)
      // .emit('message', { message: `${socket.id}가 나갔습니다.` });

      this.logger.log(`Socket disconnected: ${socket.id}`);

    } catch (error) {
      throw new WsException(error);
    }
  }



  @SubscribeMessage('enter-chat')
  async handleSetClientDataEvent(@ConnectedSocket() socket: Socket, @MessageBody() dto : ChannelIdDto){
    try {
      const user_id = this.getUserIdBySocketId(socket.id);
      if (!user_id || !(await this.chatSocketService.checkChannelUser(dto.channel_id, user_id)))
      return { error: 'No permission!' };
    
      socket.join(`chat_${dto.channel_id}`);
      socket.broadcast
       .to(`chat_${dto.channel_id}`)
       .emit('message', { message: `${user_id} 유저가 들어왔습니다.` });
      this.logger.log(`Socket connected: ${socket.id}`);  

    } catch (error) {
   throw new WsException(error);
    }
  }
  
  @SubscribeMessage('leave-chat')
  async handleLeaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() dto : ChannelIdDto) {
    try {
      const user_id = this.getUserIdBySocketId(socket.id);
      if (!user_id || !(await this.chatSocketService.checkChannelUser(dto.channel_id, user_id)))
        return { error: 'No permission!' };
    
      socket.leave(`chat_${dto.channel_id}`); // leave room
      socket.broadcast
      .to(`chat_${dto.channel_id}`)
      .emit('message', { message: `${user_id}가 나갔습니다.` });

    } catch (error) {
   throw new WsException(error);
    }
  }


  @SubscribeMessage('message-chat')
  async handleChatEvent(@ConnectedSocket() socket: Socket, @MessageBody() md: MessageDto) {
    this.logger.log(md.channel_id + "  :" +md.message);
    try {
      const user_id = this.getUserIdBySocketId(socket.id);
      if (!user_id || !(await this.chatSocketService.checkChannelUser(md.channel_id, user_id)))
        return { error: 'No permission!' };
      await this.chatSocketService.createMessageLog(user_id, md);

      socket.broadcast
      .to(`chat_${md.channel_id}`)
      .emit('chat', md);

    } catch (error) {
      throw new WsException(error);
    }
  
  }

  @SubscribeMessage('user-list-chat')


  getSocketIdByUserId(userId: number) {
    return this.users.find((u) => u.userId === userId)?.socketId;
  }

  getUserIdBySocketId(socketId: string) {
    return this.users.find((u) => u.socketId === socketId)?.userId;
  }

  handleJoinChatChannel(userId: number, channelId: number) {
    const socketId = this.getSocketIdByUserId(userId);
    if (socketId) {
      this.server.in(socketId).socketsJoin(`chat_${channelId}`);
    }
  }
 

}