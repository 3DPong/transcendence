import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { NotifyService } from './services';
import { SessionGuard } from '../../../common/guards/session/session.guard';

/**
 * NotifyGateway 의 경우 Entriy Point 로 사용하지 않기 때문에 특별한 행동을 하지 않습니다.
 * Connect, Disconnect 경우에만 User 의 상태를 변경합니다.
 */
@WebSocketGateway()
@UseGuards(SessionGuard)
export class NotifyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly notifyService: NotifyService) {}

  async handleConnection(@ConnectedSocket() socket) {
    await this.notifyService.connect(socket);
  }

  async handleDisconnect(@ConnectedSocket() socket) {
    await this.notifyService.disconnect(socket);
  }
}
