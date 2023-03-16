import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { Namespace, Socket } from 'socket.io';


@WebSocketGateway({
  namespace: 'simpleChat',
  cors: {
    origin: ['http://localhost:3001'], //리액트에서 사용하는 port number 넣기
  },
})
export class ChatSimpleSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('Gateway');

  @WebSocketServer() nsp: Namespace;
  @WebSocketServer() server:Server;


  @SubscribeMessage('ClientToServer')
  async handleMessag(
    @MessageBody() data,
    @ConnectedSocket() socket: Socket
  ) {
    this.logger.log(`"${socket.id} 로 부터 메세지 받음"`);
    this.server.emit('ServerToClient', `recived data`);
  }


  afterInit() {
    this.nsp.adapter.on('create-room', (room) => {
      this.logger.log(`"[ 1-1 ] Room:${room}"이 생성되었습니다.`);
    });


    this.nsp.adapter.on('join-room', (room, id) => {
      this.logger.log(`"[ 1-2 ] Socket:${id}"이 "Room:${room}"에 참여하였습니다.`);
    });


    this.nsp.adapter.on('leave-room', (room, id) => {
      this.logger.log(`"[ 1-3 ] Socket:${id}"이 "Room:${room}"에서 나갔습니다.`);
    });


    this.nsp.adapter.on('delete-room', (roomName) => {
      this.logger.log(`"[ 1-4 ] Room:${roomName}"이 삭제되었습니다.`);
    });

    this.logger.log('-----------------------------------------------------------------');
  }


  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[ 2-1 ] ${socket.id} 소켓 연결`);


    socket.broadcast.emit('message', {
      message: `[ 2-2 ] ${socket.id}가 들어왔습니다.`,
    });
  }


  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`[ 3-1 ] ${socket.id} 소켓 연결 해제 `);
  }


  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string,
  ) {
    socket.broadcast.emit('message', { username: socket.id, message });
    return { username: socket.id, message };
  }
}