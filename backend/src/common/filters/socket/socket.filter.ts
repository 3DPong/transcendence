import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export type ExceptionStatus =
  | 'BadRequest'
  | 'Unauthorized'
  | 'Conflict'
  | 'Forbidden'
  | 'NotFound'
  | 'InternalServerError';

export class SocketException extends WsException {
  status: string;
  message: string;
  constructor(status: ExceptionStatus, message: string) {
    super({ status, message });
    this.status = status;
    this.message = message;
  }
}

@Catch(SocketException)
export class SocketExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: SocketException, host: ArgumentsHost) {
    const socket: Socket = host.getArgByIndex(0);

    socket.emit('error', {
      status: exception.status,
      message: exception.message,
    });
  }
}
