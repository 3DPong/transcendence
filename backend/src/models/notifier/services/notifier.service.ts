import { Injectable, Logger } from '@nestjs/common';
import { Namespace, Server } from 'socket.io';
import { SocketMapService } from '../../../providers/redis/socketMap.service';

@Injectable()
export class NotifierService {
  private readonly logger = new Logger('NotifierService');

  constructor(private readonly socketMapService: SocketMapService) {}

  async notifyToUser(server: Server, userId: number, event: string, data: any) {
    const userSockets = await this.socketMapService.getUserSockets(userId);
    if (!userSockets) return;
    const socketId = userSockets.notify;
    if (!socketId) return;
    const notifyNamespace: Namespace = await server.of('/notify');

    notifyNamespace.to(socketId).emit(event, data);
    this.logger.log(`notify to user ${userId} with event ${event} and data ${data}`);
  }

  async notifyToUsers(server: Server, userIds: number[], event: string, data: any) {
    for (const userId of userIds) {
      await this.notifyToUser(server, userId, event, data);
    }
  }

  async notifyToSpecificChatChannel(server: Server, channelId: number, event: string, data: any) {
    const channelServer: Namespace = await server.of('/chat');
    const channelRoom = `chat_active_${channelId}`;
    if (channelServer.adapter.rooms.has(channelRoom) === false) {
      // for debug
      this.logger.debug(`room ${channelRoom} doesn't exist`);
      return;
    }

    channelServer.to(channelRoom).emit(event, data);
    this.logger.log(`notify to channel ${channelId} with event ${event} and data ${data}`);
  }

  async notifyToJoinedChatChannels(server: Server, channels: number[], event: string, data: any) {
    for (const channelId of channels) {
      await this.notifyToSpecificChatChannel(server, channelId, event, data);
    }
  }
}
