// session-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SessionStatusEnum } from '../../enums/sessionStatus.enum';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class SocketSessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const { session } = client.handshake as any;

    if (!session.user_id || session.sessionStatus !== SessionStatusEnum.SUCCESS)
      throw new WsException('invalid session');
    return true;
  }
}
