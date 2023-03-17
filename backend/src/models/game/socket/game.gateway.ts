import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { v4 as uuidv4} from 'uuid';
import { GameModEnum } from '../enum/gameModEnum';
import { GameRoomTypeEnum } from '../enum/gameRoomTypeEnum';
import { GameRoom } from '../gameRoom';
import { createMatchDto } from '../game_dto/createMatch.dto';
import { Player } from '../player';
//import { PongSimulator } from '../simulation/PongSimulator';
import { GameService } from './services';
import * as Box2d from '../Box2D';
//import Box2DFactory = require("box2d-wasm");
@WebSocketGateway(4242, {
  namespace : 'game',
  cors : {origin : '*'}, 
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  private gameRooms : GameRoom[] = [];

  constructor(
    private readonly gameService : GameService,
  ){}
  async handleConnection() {
    console.log('socket connet');
  }
  async handleDisconnect() {
    console.log('socket disconnet');
  }

  @SubscribeMessage('test')
  async socketStats(@MessageBody() data: any,) : Promise<any> {
    console.log(data);
    this.server.emit('test', data);
    return data;
  }

  //모드 맞는 방 찾아서 매칭하고 없으면 생성  
  @SubscribeMessage('randomMatch')
  match(
    @MessageBody() dto : createMatchDto,
    @ConnectedSocket() client : Socket,
  ) {
    const roomidx : number = this.gameRooms.findIndex(
      (room : GameRoom) => 
        room.gameRoomType === GameRoomTypeEnum.RANDOM &&
        room.gameMod === dto.gameMod &&
        room.players.length === 1
      );
    const player : Player = this.gameService.createGamePlayer(client.id);
    if (roomidx === -1){
      const createdRoom = this.gameService.createRandomMatchRoom(dto.gameMod);
      
      createdRoom.players.push(player);
      this.gameRooms.push(createdRoom);
      this.gameService.socketJoinRoom(client, createdRoom.id);
      this.server.to(createdRoom.id).emit('gameCreate', createdRoom);
    }
    else {
      const room : GameRoom = this.gameRooms[roomidx];

      this.gameService.socketJoinRoom(client, room.id);
      this.gameRooms[roomidx].players.push(player);
      this.server.to(room.id).emit('gameStart', room);
      //game start
    }
  }
  //game 시작전 나가기 누르면 매칭시스템에서 탈출
  @SubscribeMessage('exit')
  matchExit(
    @ConnectedSocket() client : Socket,
  ) {
    const roomidx : number = this.gameRooms.findIndex(
      (room : GameRoom) => 
        room.players.length === 1 &&
        room.players[0].sid === client.id
      );
      if (roomidx){
        this.server.emit('gameExit', 'player is not in gameRoom');
        return;
      }
      this.gameService.socketLeaveRoom(client, this.gameRooms[roomidx].id);
      this.server.emit('gameExit', this.gameRooms[roomidx]);
      this.gameRooms.splice(roomidx,1);
  }

  @SubscribeMessage('makeSimul')
  makeSimul(
    @ConnectedSocket() client : Socket
  ) {

      const { BodyDef, dynamicBody, PolygonShape, Vec2, World } = Box2d;
      const gravity = new Vec2(0, 10);
      const world = new World(gravity);
    
      const sideLengthMetres = 1;
      const square = new PolygonShape();
      square.SetAsBox(sideLengthMetres/2, sideLengthMetres/2);
    
      const zero = new Vec2(0, 0);
    
      const bd = new BodyDef();
      // bd. = (zero);
    
      const body = world.CreateBody(bd);
      body.CreateFixture(square, 1);
      body.SetType(dynamicBody);
      body.SetPosition(zero);
      body.SetTransformVec(zero, 0);
      body.SetLinearVelocity(zero);
      body.SetAwake(true);
      body.SetEnabled(true);
    
      const timeStepMillis = 1/60;
      const velocityIterations = 1;
      const positionIterations = 1;
      const floatCompareTolerance = 0.01;
    
      const iterations = 6;
      for (let i=0; i<iterations; i++) {
        const timeElapsedMillis = timeStepMillis*i;
        {
          const {y} = body.GetLinearVelocity();
       
          {
            const {y} = body.GetPosition();
           
          }
        }
        world.Step(timeStepMillis, velocityIterations, positionIterations);
      }
      
      console.log(`👍 Ran ${iterations} iterations of a falling body. Body had the expected position on each iteration.`);

  }
/*
  @SubscribeMessage('inChatMatch')
  match(
    @MessageBody() dto : createMatchDto,
    @ConnectedSocket() client : Socket,
  ) {

  }*/
}
