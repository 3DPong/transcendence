// import { OnGatewayConnection, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
// import { Socket, Server } from "socket.io";

// @WebSocketGateway({
// 	namespace: 'chat',
//   cors: {
//     origin: ['http://localhost:3001'],
// 		//origin: process.env.FRONT_URL,
//   }
// })
// export class ChatGeteway implements OnGatewayInit, OnGatewayConnection, OnGatewayConnection {
	
// 	@WebSocketServer()
// 	private server: Server;
// 	private user: { intra : number, socketId:string }[] = [];

// 	afterInit() {

// 	}
	

// 	handleConnection(@ConnectedSocket() socket: Socket) {
//   }


//   handleDisconnect(@ConnectedSocket() socket: Socket) {
//   }

// 	emitChannel() {

// 	}
// }