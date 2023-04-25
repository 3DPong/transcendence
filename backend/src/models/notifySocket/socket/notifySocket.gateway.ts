import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { NotifySocketService } from './services';
import { WsExceptionFilter } from '../../../common/filters/socket/wsException.filter';
import { Server, Socket } from 'socket.io';
import { SocketException } from '../../../common/filters/socket/socket.filter';

/**
 * NotifyGateway 의 경우 Entriy Point 로 사용하지 않기 때문에 특별한 행동을 하지 않습니다.
 * Connect, Disconnect 경우에만 User 의 상태를 변경합니다.
 */
// @UseGuards(SocketSessionGuard)
@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: 'notify' })
export class NotifySocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly notifyService: NotifySocketService) {}
  private readonly logger = new Logger('NotifySocketGateway');
  @WebSocketServer()
  server: Server;
  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      await this.notifyService.connect(socket);
    } catch (e: any) {
      this.logger.error(`${e} on connecting`);
      if (e instanceof SocketException && e.status === 'Conflict') {
        socket.emit('duplicate_error', {
          status: e.status,
          message: e.message,
        });
      }
      socket.disconnect();
    }
  }
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      await this.notifyService.disconnect(socket);
    } catch (e) {
      this.logger.error(`${e} on disconnecting`);
    }
  }
}
