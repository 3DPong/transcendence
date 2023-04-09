import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { Socket } from 'socket.io';

export type ExceptionStatus =
    | 'BadRequest'
    | 'Unauthorized'
    | 'Forbidden'
    | 'NotFound'
    | 'Conflict'
    | 'InternalServerError';

export class SocketException extends WsException {
  constructor(status: ExceptionStatus, message: string) {
      super({ status, message });
  }
}

@Catch(SocketException)
export class SocketExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: SocketException, host: ArgumentsHost) {

        const socket:Socket = host.getArgByIndex(0);
        const error = exception.getError();

        socket.emit('error', {
            status: `${Object.values(error)[0]}`,
            message: `${Object.values(error)[1]}`
          });
    }
}
