import { Server } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { NotifierService } from './services/notifier.service';

@WebSocketGateway()
export class NotifierGateway {
  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly notifierService: NotifierService) {}

  async notifyToUser(userId: number, event: string, data: any) {
    return await this.notifierService.notifyToUser(this.server, userId, event, data);
  }

  async notifyToUsers(userIds: number[], event: string, data: any) {
    return await this.notifierService.notifyToUsers(this.server, userIds, event, data);
  }

  async notifyToSpecificChatChannel(channelId: number, event: string, data: any) {
    return await this.notifierService.notifyToSpecificChatChannel(this.server, channelId, event, data);
  }

  async notifyToJoinedChatChannels(channels: number[], event: string, data: any) {
    return await this.notifierService.notifyToJoinedChatChannels(this.server, channels, event, data);
  }
}
