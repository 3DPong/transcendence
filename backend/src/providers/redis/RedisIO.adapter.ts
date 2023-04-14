import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

const envChecker = () => {
  if (!process.env.REDIS_PORT_NUMBER || !process.env.REDIS_HOST || !process.env.REDIS_PASSWORD) {
    throw new Error('REDIS_PORT, REDIS_HOST, REDIS_PASSWORD must be set in .env file');
  }
};

/**
 * RedisIoAdapter 의 경우 Redis에 직접 데이터를 주입하는 방식이 아님.
 * PubSub 기능을 사용함.
 */
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    envChecker();
    const pubClient = new Redis({
      port: +process.env.REDIS_PORT_NUMBER,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      db: 2,
      keyPrefix: 'SocketAdapter:',
      lazyConnect: true, // connect()를 호출하기 전까지 연결하지 않음. 서버 첫 시작에서 connect 가 꼬이는 과정을 방지함.
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
