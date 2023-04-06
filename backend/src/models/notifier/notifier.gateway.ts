import { Logger } from '@nestjs/common';
import { Namespace, Server } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@WebSocketGateway()
export class NotifierGateway {
  @WebSocketServer()
  private readonly server: Server;
  private readonly redisClient: Redis;
  private readonly logger: Logger = new Logger('UserNotifyService');

  constructor(private readonly redisService: RedisService) {
    this.redisClient = redisService.getClient();
  }

  async notifyToUser(userId: number, event: string, data: any) {
    const userSockets: string = await this.redisClient.get(`${userId}`);
    if (!userSockets) return;
    const { socketId } = JSON.parse(userSockets);
    if (!socketId) return;
    const notifyNamespace: Namespace = await this.server.of('/notify');

    notifyNamespace.to(socketId).emit(event, data);
    this.logger.log(`notify to user ${userId} with event ${event} and data ${data}`);
  }

  async notifyToUsers(userIds: number[], event: string, data: any) {
    for (const userId of userIds) {
      await this.notifyToUser(userId, event, data);
    }
  }

  async notifyToSpecificChatChannel(channelId: number, event: string, data: any) {
    const channelServer: Namespace = await this.server.of('/chat');
    const channelRoom = `chat_${channelId}`;
    if (channelServer.adapter.rooms.has(channelRoom) === false) {
      // for debug
      this.logger.debug(`room ${channelRoom} doesn't exist`);
      return;
    }

    channelServer.to(channelRoom).emit(event, data);
    this.logger.log(`notify to channel ${channelId} with event ${event} and data ${data}`);
  }

  async notifyToJoinedChatChannels(channels: number[], event: string, data: any) {
    for (const channelId of channels) {
      await this.notifyToSpecificChatChannel(channelId, event, data);
    }
  }
}
