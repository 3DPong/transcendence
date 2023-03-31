import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Logger} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatSocketService } from './services/chatSocket.service';
import { SocketAddress } from 'net';
import { MessageDto, toggleDto } from '../dto/create-channel.dto';

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
    //1.socketId 에 대한 유효성 검사
    //2.유저 채팅 상태 on -> 옵션
    //const user = await this.chatSocketService.getUserbySocket(socket);
    //if (!user) return socket.disconnect();
    //3. 채팅방 여러개 연결 ->옵션
    //const rooms = await getMyChannels(user);
    //for (let room of rooms) socket.join('' + room.roomID);
    //socket.data.user = user;
    const { user_id, channel_id } = socket.handshake.query; //string 으로 들어옴

    try {
      const userIndex = this.users.findIndex((u) => u.userId.toString() === user_id);
      if (userIndex >= 0) {
          this.server.in(this.users[userIndex].socketId).disconnectSockets();
          this.users[userIndex].socketId = socket.id;
      } else {
        this.users.push({ userId: parseInt(user_id[0]), socketId: socket.id });
      }
      socket.join(channel_id);
      socket.data.user = user_id;
      socket.data.chnnel = channel_id;
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
      socket.leave(channel_id); // leave room
      socket.broadcast
      .to(channel_id)
      .emit('message', { message: `${socket.id} 가 나갔습니다.` });

      this.logger.log(`Socket disconnected: ${socket.id}`);

    } catch (error) {
      throw new WsException(error);
    }
  }


  @SubscribeMessage('message-chat')
  async handleChatEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() md: MessageDto,
  ) {
    try {
      const user_id = this.getUserIdBySocketId(socket.id);
      if (!user_id || !(await this.chatSocketService.checkChannelUser(md.channel_id, user_id)))
        return { error: 'No permission!' };
      this.logger.log(md);
      await this.chatSocketService.createMessageLog(user_id, md);

      this.server
      .to(`chat_${md.channel_id}`)
      .emit('chat', md); // broadcast messages

    } catch (error) {
      throw new WsException(error);
    }
  
  }

  @SubscribeMessage('enter-chat')
  async handleSetClientDataEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channel_id : number
  ){
    try {
      const user_id = this.getUserIdBySocketId(socket.id);
      if (!user_id || !(await this.chatSocketService.checkChannelUser(channel_id, user_id)))
      return { error: 'No permission!' };
    
      await this.server.in(socket.id).socketsJoin(`chat_${channel_id}`);
        
      socket.broadcast
      .to(`chat_${channel_id}`)
      .emit('message', { message: `${socket.id}가 들어왔습니다.` });

    } catch (error) {
      throw new WsException(error);
    }
  }
  
  @SubscribeMessage('leave-chat')
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channel_id : number
  ) {
    try {
      const user_id = this.getUserIdBySocketId(socket.id);
      if (!user_id || !(await this.chatSocketService.checkChannelUser(channel_id, user_id)))
        return { error: 'No permission!' };
    
      socket.leave(`chat_${channel_id}`); // leave room
      socket.broadcast
      .to(`chat_${channel_id}`)
      .emit('message', { message: `${socket.id}가 나갔습니다.` });

    } catch (error) {
      throw new WsException(error);
    }
  }

  @SubscribeMessage('mute-chat')
  async muteChannelUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() muteDto: toggleDto,
  ) {
    const {user_id, channel_id, time_at} = muteDto;
    try {
      const adminId = this.getUserIdBySocketId(socket.id);
      if (!adminId ||
        !(await this.chatSocketService.checkAdminUser(channel_id, adminId)) ||
        !(await this.chatSocketService.checkChannelUser(channel_id, user_id)))
         return { error: 'No permission!' };
      
      const muted = this.chatSocketService.checkMuteUser(channel_id, user_id);
      if (muted) {
        await this.chatSocketService.unmuteUser(channel_id, user_id);
        this.server.to(`chat_${channel_id}`).emit('unmute', {user_id, channel_id});
        
      } else {
        const mute = await this.chatSocketService.muteUser(muteDto);
        if (!mute)
         return { error: 'Server error!' };
        const timeout = setTimeout(async() => {
          await this.chatSocketService.unmuteUser(channel_id, user_id);
          this.server.to(`chat_${channel_id}`).emit('unmute', {user_id, channel_id});
        }, 5000);
      }
    } catch (error) {
      throw new WsException(error);
    }
  }



  @SubscribeMessage('ban-chat')
  async banChannelUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() md: toggleDto,
  ) {

  }


  @SubscribeMessage('kick-chat')

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