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
import { Logger } from '@nestjs/common';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Message,
  User,
} from './chat.interface';
import { Server, Socket } from 'socket.io';
import { ChatSocketService } from './services/chatSocket.service';
import { SocketAddress } from 'net';

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
      this.logger.log(`Socket connected: ${socket.id}`);
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

  getSocketIdFromUserId(userId: number) {
    return this.users.find((u) => u.userId === userId)?.socketId;
  }
  @SubscribeMessage('chat')
  async handleChatEvent(
    @MessageBody()
    payload: Message,
  ): Promise<Message> {
    this.logger.log(payload);
    this.server
    .to(payload.roomName)
    .emit('chat', payload); // broadcast messages
    return payload;
  }

  @SubscribeMessage('enter_room')
  async handleSetClientDataEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    payload: {
      channelName: string;
      user: User;
    },
  ) {
    if (payload.user.socketId) {
      this.logger.log(`${payload.user.socketId} is entering ${payload.channelName}`);
      await this.server.in(payload.user.socketId).socketsJoin(payload.channelName);
      
      socket.broadcast
      .to(payload.channelName)
      .emit('message', { message: `${socket.id}가 들어왔습니다.` });

     // await this.chatSocketService.addUserToRoom(payload.roomName, payload.user);
    }
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelName: string,
  ) {
    try {
      socket.leave(channelName); // leave room
      socket.broadcast
      .to(channelName)
      .emit('message', { message: `${socket.id}가 나갔습니다.` });

    } catch (error) {
      throw new WsException(error);
    }
  }


  // handleRemoveSocketIdFromRoom(userId: number, conversationId: number) {
  //   const socketId = this.socketGateway.getSocketIdFromUserId(userId);
  //   if (socketId) this.server.in(socketId).socketsLeave(`chatRoom_${conversationId}`);
  // }


 

}