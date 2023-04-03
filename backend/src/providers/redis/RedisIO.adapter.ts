import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { RedisConfigService } from '../../config/redis/config.service';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  constructor(private readonly redisConfigService: RedisConfigService) {
    super();
  }
  async connectToRedis(): Promise<void> {
    const pubClient = new Redis({
      port: this.redisConfigService.port,
      host: this.redisConfigService.host,
      password: this.redisConfigService.password,
      db: this.redisConfigService.socketDB,
      keyPrefix: 'socket:',
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
