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

    const user_id = this.getUserIdBySocketId(socket.id);
    if (!user_id || !(await this.chatSocketService.checkChannelUser(dto.channel_id, user_id)))
      throw new SocketException('Forbidden', `권한이 없습니다!`);
    
    try {
      socket.join(`chat_${dto.channel_id}`);
      socket.broadcast
       .to(`chat_${dto.channel_id}`)
       .emit('message', { message: `${user_id} 유저가 들어왔습니다.` });
      this.logger.log(`Socket connected: ${user_id}`);  

    } catch (error) {
      this.logger.log(error)
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  }
  
  @SubscribeMessage('leave-chat')
  async handleLeaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() dto : ChannelIdDto) {

    const user_id = this.getUserIdBySocketId(socket.id);
    if (!user_id || !(await this.chatSocketService.checkChannelUser(dto.channel_id, user_id)))
      throw new SocketException('Forbidden', `권한이 없습니다!`);
    try {
      socket.leave(`chat_${dto.channel_id}`); // leave room
      socket.broadcast
      .to(`chat_${dto.channel_id}`)
      .emit('message', { message: `${user_id}가 나갔습니다.` });

    } catch (error) {
      this.logger.log(error)
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  }


  @SubscribeMessage('message-chat')
  async handleChatEvent(@ConnectedSocket() socket: Socket, @MessageBody() md: MessageDto) {
    this.logger.log(md.channel_id + "  :" +md.message + " ");
    let dmUser;
    const user_id = this.getUserIdBySocketId(socket.id);
    if (!user_id)
      throw new SocketException('Forbidden', `권한이 없습니다!`);

    const channel = await this.chatSocketService.getChannelType(md.channel_id);
    if (!channel) {
      throw new SocketException('BadRequest', `채널을 찾을 수 없습니다!`);
    } else if (channel.type === ChannelType.DM && !(dmUser = await this.chatSocketService.getDmUser(md.channel_id, user_id))) {
      throw new SocketException('BadRequest', `디엠 유저를 찾을 수 없습니다!`);
    } else if (channel.type !== ChannelType.DM && !await this.chatSocketService.checkChannelUser(md.channel_id, user_id)) {
      throw new SocketException('BadRequest', `채팅 유저를 찾을 수 없습니다!`);
    }

    if (await this.chatSocketService.checkMuteUser(md.channel_id, user_id)) {
      throw new SocketException('Forbidden', `뮤트 상태입니다!`);
    }
 
    try {
      await this.chatSocketService.createMessageLog(user_id, md, channel.type);
      if (channel.type === ChannelType.DM) {
        await this.chatSocketService.updateDmUser(dmUser);
      }
      socket.broadcast
      .to(`chat_${md.channel_id}`)
      .emit('chat', md);

    } catch (error) {
      this.logger.log(error)
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  
  }

  @SubscribeMessage('mute-chat')
  async muteChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() muteDto: toggleTimeDto) {
    const {user_id, channel_id} = muteDto;
    const adminId = this.getUserIdBySocketId(socket.id);

    if (!adminId ||
      !(await this.chatSocketService.checkAdminUser(channel_id, adminId)) ||
      !(await this.chatSocketService.checkChannelUserRole(channel_id, user_id)))
        throw new SocketException('Forbidden', `권한이 없습니다!`);

    try {
      const muted = await this.chatSocketService.checkMuteUser(channel_id, user_id);
    
      if (muted) {
        await this.chatSocketService.unmuteUser(channel_id, user_id);
        this.server.to(`chat_${channel_id}`).emit('mute', { message: `${user_id} 가 뮤트 해제 되었습니다.` });
        
      } else {
        if (muteDto.end_at === null) {
          throw new SocketException('BadRequest', `뮤트 해제 시간을 추가하세요!`);
        }
        const mute = await this.chatSocketService.muteUser(muteDto);
        if (!mute)
          throw new SocketException('InternalServerError', `뮤트 실패!`);
        this.server.to(`chat_${channel_id}`).emit('mute', { message: `${user_id} 가 뮤트 되었습니다.` });
      }
    } catch (error) {
      this.logger.log(error)
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  }

  @SubscribeMessage('ban-chat')
  async banChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() banDto: toggleTimeDto) {
    const {user_id, channel_id} = banDto;

    const adminId = this.getUserIdBySocketId(socket.id);
    if (!adminId ||
      !(await this.chatSocketService.checkAdminUser(channel_id, adminId)) ||
      !(await this.chatSocketService.checkChannelUserRole(channel_id, user_id)))
        throw new SocketException('Forbidden', `권한이 없습니다!`);
    try {
      const banned = await this.chatSocketService.checkBanUser(channel_id, user_id);

      if (banned) {
        throw new SocketException('Conflict', `이 유저는 이미 밴 상태입니다!`);
      } else {
        const banned = await this.chatSocketService.banUser(banDto);
        if (!banned)
          throw new SocketException('InternalServerError', `밴 실패!`);

        await this.chatSocketService.kickUser(channel_id, user_id);
        const userSocket = this.getSocketIdByUserId(user_id);
        if (userSocket)
         this.server.in(userSocket).socketsLeave(`chat_${channel_id}`);
        
        this.server.to(`chat_${channel_id}`).emit('ban', { message: `${user_id} 가 밴 되었습니다.` });
      }
    } catch (error) {
      this.logger.log(error)
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  }

  @SubscribeMessage('unban-chat')
  async unbanChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() unbanDto: toggleDto) {
    const {user_id, channel_id} = unbanDto;
    const adminId = this.getUserIdBySocketId(socket.id);
    if (!adminId ||
      !(await this.chatSocketService.checkAdminUser(channel_id, adminId)))
        throw new SocketException('Forbidden', `권한이 없습니다!`);
    
    try {
      const banned = await this.chatSocketService.checkBanUser(channel_id, user_id);
      if (banned) {
        await this.chatSocketService.unbanUser(channel_id, user_id);
        this.server.to(`chat_${channel_id}`).emit('ban', { message: `${user_id} 가 밴 해제 되었습니다.` });
      }  else {
        throw new SocketException('Conflict', `밴 유저가 아닙니다!`);
      }
    } catch (error) {
      this.logger.log(error)
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  }


  @SubscribeMessage('kick-chat')
  async kickChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() kickDto: toggleDto) {
    const {user_id, channel_id} = kickDto;

    const adminId = this.getUserIdBySocketId(socket.id);
    if (!adminId ||
      !(await this.chatSocketService.checkAdminUser(channel_id, adminId)) ||
      !(await this.chatSocketService.checkChannelUserRole(channel_id, user_id)))
        return { error: 'No permission!' };
    try {
      await this.chatSocketService.kickUser(channel_id, user_id);
     const userSocket = this.getSocketIdByUserId(user_id);
     if (userSocket)
      this.server.in(userSocket).socketsLeave(`chat_${channel_id}`);

      this.server.to(`chat_${channel_id}`).emit(`kick`,  { message: `${user_id} 가 강제 퇴장 되었습니다.` });
    } catch (error) {
      this.logger.log(error)
      throw new SocketException('InternalServerError', `${error.message}`);
    }
  }

  getSocketIdByUserId(userId: number) {
    return this.users.find((u) => u.userId === userId)?.socketId;
  }

  getUserIdBySocketId(socketId: string) {
    return this.users.find((u) => u.socketId === socketId)?.userId;
  } 

}