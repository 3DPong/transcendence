import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';

/**
 * 현재 서버 환경이 하나의 인스턴스로 돌기 때문에 임시로 해당되는 부분을 flush 하도록 했습니다.
 * 이후 scale-out 되었을 때는 다른 전력이 필요합니다.
 */
@Injectable()
export class AppService implements OnModuleInit {
  private readonly redisClient;
  constructor(private redisService: RedisService) {
    this.redisClient = redisService.getClient();
  }
  async onModuleInit() {
    this.redisClient.flushall();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
