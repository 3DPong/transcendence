import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseFilters } from '@nestjs/common';
import { UserStatusSocketService } from './services';
import { WsExceptionFilter } from '../../../common/filters/socket/wsException.filter';
import { Server } from 'socket.io';

/**
 * NotifyGateway 의 경우 Entriy Point 로 사용하지 않기 때문에 특별한 행동을 하지 않습니다.
 * Connect, Disconnect 경우에만 User 의 상태를 변경합니다.
 */
// @UseGuards(SocketSessionGuard)
@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: 'notify' })
export class UserStatusSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly notifyService: UserStatusSocketService) {}
  @WebSocketServer()
  server: Server;
  async handleConnection(@ConnectedSocket() socket) {
    await this.notifyService.connect(socket);
  }
  async handleDisconnect(@ConnectedSocket() socket) {
    await this.notifyService.disconnect(socket);
  }
}
