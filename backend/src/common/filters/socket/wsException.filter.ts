import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

/**
 * Global HTTP exception filter
 * 현재는 아무 기능 없습니다.
 */
@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger();
  catch(exception: WsException, host: ArgumentsHost) {
    super.catch(exception, host);
    const ctx = host.switchToWs();
    const message = exception.message;
    const clientSocket: Socket = ctx.getClient();

    clientSocket.emit('error', message);
    this.logger.error(`${message}`);
  }
}
