import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class RedisConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('redis.port');
  }
  get host(): string {
    return this.configService.get<string>('redis.host');
  }
  get password(): string {
    return this.configService.get<string>('redis.password');
  }
  get sessionDB(): number {
    return this.configService.get<number>('redis.sessionDB');
  }
  get socketDB(): number {
    return this.configService.get<number>('redis.socketDB');
  }
}
