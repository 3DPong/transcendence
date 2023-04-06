import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatSocketService } from './services/chatSocket.service';
import { ChannelIdDto, MessageDto, toggleDto, toggleTimeDto } from '../dto/socket.dto';
import { WsException } from '@nestjs/websockets';
import { ChannelType } from '../entities';

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
    const { user_id } = socket.data
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
      throw { error: 'No permission!' };
    
    try {
      socket.join(`chat_${dto.channel_id}`);
      socket.broadcast
       .to(`chat_${dto.channel_id}`)
       .emit('message', { message: `${user_id} 유저가 들어왔습니다.` });
      this.logger.log(`Socket connected: ${user_id}`);  

    } catch (error) {
      this.logger.log(error)
      throw new WsException(error);
    }
  }
  
  @SubscribeMessage('leave-chat')
  async handleLeaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() dto : ChannelIdDto) {

    const user_id = this.getUserIdBySocketId(socket.id);
    if (!user_id || !(await this.chatSocketService.checkChannelUser(dto.channel_id, user_id)))
      throw { error: 'No permission!' };
    try {
      socket.leave(`chat_${dto.channel_id}`); // leave room
      socket.broadcast
      .to(`chat_${dto.channel_id}`)
      .emit('message', { message: `${user_id}가 나갔습니다.` });

    } catch (error) {
      this.logger.log(error)
      throw new WsException(error);
    }
  }


  @SubscribeMessage('message-chat')
  async handleChatEvent(@ConnectedSocket() socket: Socket, @MessageBody() md: MessageDto) {
    this.logger.log(md.channel_id + "  :" +md.message + " ");
    let dmUser;
    const user_id = this.getUserIdBySocketId(socket.id);
    if (!user_id)
      throw { error: 'No permission!' };

    const channel = await this.chatSocketService.getChannelType(md.channel_id);
    if (!channel) {
      throw { error:`can't find  ${ md.channel_id}`};
    } else if (channel.type === ChannelType.DM && !(dmUser = await this.chatSocketService.getDmUser(md.channel_id, user_id))) {
      throw { error:`can't find  DM user ${user_id}`};
    } else if (channel.type !== ChannelType.DM && !await this.chatSocketService.checkChannelUser(md.channel_id, user_id)) {
      throw { error:`can't find ${ md.channel_id}'s user ${user_id}`};
    }

    if (await this.chatSocketService.checkMuteUser(md.channel_id, user_id)) {
      throw { error:`뮤트 상태 입니다!`};
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
      throw new WsException(error);
    }
  
  }

  @SubscribeMessage('mute-chat')
  async muteChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() muteDto: toggleTimeDto) {
    const {user_id, channel_id} = muteDto;
    const adminId = this.getUserIdBySocketId(socket.id);

    if (!adminId ||
      !(await this.chatSocketService.checkAdminUser(channel_id, adminId)) ||
      !(await this.chatSocketService.checkChannelUserRole(channel_id, user_id)))
        throw { error: 'No permission!' };

    try {
      const muted = await this.chatSocketService.checkMuteUser(channel_id, user_id);
    
      if (muted) {
        await this.chatSocketService.unmuteUser(channel_id, user_id);
        this.server.to(`chat_${channel_id}`).emit('mute', { message: `${user_id} 가 뮤트 해제 되었습니다.` });
        
      } else {
        if (muteDto.end_at === null)
          throw {error: '뮤트 해제 시간 없음.'} 
        const mute = await this.chatSocketService.muteUser(muteDto);
        if (!mute)
          throw { error: 'Server error!' };
        this.server.to(`chat_${channel_id}`).emit('mute', { message: `${user_id} 가 뮤트 되었습니다.` });
      }
    } catch (error) {
      this.logger.log(error)
      throw new WsException(error);
    }
  }

  @SubscribeMessage('ban-chat')
  async banChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() banDto: toggleTimeDto) {
    const {user_id, channel_id} = banDto;

    const adminId = this.getUserIdBySocketId(socket.id);
    if (!adminId ||
      !(await this.chatSocketService.checkAdminUser(channel_id, adminId)) ||
      !(await this.chatSocketService.checkChannelUserRole(channel_id, user_id)))
      throw { error: 'No permission!' };
    try {
      const banned = await this.chatSocketService.checkBanUser(channel_id, user_id);

      if (banned) {
        throw { error: '이미 밴 유저입니다!' };
      } else {
        const banned = await this.chatSocketService.banUser(banDto);
        if (!banned)
         throw { error: 'Server error!' };

        await this.chatSocketService.kickUser(channel_id, user_id);
        const userSocket = this.getSocketIdByUserId(user_id);
        if (userSocket)
         this.server.in(userSocket).socketsLeave(`chat_${channel_id}`);
        
        this.server.to(`chat_${channel_id}`).emit('ban', { message: `${user_id} 가 밴 되었습니다.` });
      }
    } catch (error) {
      this.logger.log(error)
      throw new WsException(error);
    }
  }

  @SubscribeMessage('unban-chat')
  async unbanChannelUser(@ConnectedSocket() socket: Socket, @MessageBody() unbanDto: toggleDto) {
    const {user_id, channel_id} = unbanDto;
    const adminId = this.getUserIdBySocketId(socket.id);
    if (!adminId ||
      !(await this.chatSocketService.checkAdminUser(channel_id, adminId)))
      throw { error: 'No permission!' };
    
    try {
      const banned = await this.chatSocketService.checkBanUser(channel_id, user_id);
      if (banned) {
        await this.chatSocketService.unbanUser(channel_id, user_id);
        this.server.to(`chat_${channel_id}`).emit('ban', { message: `${user_id} 가 밴 해제 되었습니다.` });
      }  else {
        throw { error: '밴 유저가 아닙니다!' };
      }
    } catch (error) {
      this.logger.log(error)
      throw new WsException(error);
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
      throw new WsException(error);
    }
  }

  getSocketIdByUserId(userId: number) {
    return this.users.find((u) => u.userId === userId)?.socketId;
  }

  getUserIdBySocketId(socketId: string) {
    return this.users.find((u) => u.socketId === socketId)?.userId;
  } 

}