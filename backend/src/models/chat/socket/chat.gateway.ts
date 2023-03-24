import { WebSocketGateway } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

@WebSocketGateway()
export class ChatGeteway {


	@WebSocketServer() private server: Server;
}