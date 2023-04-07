import { Module } from '@nestjs/common';
import { RedisConfigModule } from '../../config/redis/config.module';
import { RedisConfigService } from '../../config/redis/config.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [RedisConfigModule],
      inject: [RedisConfigService],
      useFactory: async (redisConfigService: RedisConfigService) => ({
        config: {
          host: redisConfigService.host,
          port: redisConfigService.port,
          password: redisConfigService.password,
          db: redisConfigService.socketDB,
          keyPrefix: 'socket',
          lazyConnect: true, // 서버 첫 시작에서 connect 가 꼬이는 과정을 방지함.
        },
      }),
    }),
  ],
})
export class RedisStorageProviderModule {}
