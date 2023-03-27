import { IoAdapter } from "@nestjs/platform-socket.io";
//common으로 옮겨도 될거 같은데??
export class GameSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    return server;
  }
}