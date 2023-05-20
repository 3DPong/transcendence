import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class NaverConfigService {
  constructor(private configService: ConfigService) {}

  get secret(): string {
    return this.configService.get<string>('naver.secret');
  }

  get id(): string {
    return this.configService.get<string>('naver.id');
  }

  get callback(): string {
    return `http://${this.configService.get<string>('EXTERNAL_HOST')}:${this.configService.get<number>(
      'EXTERNAL_PORT'
    )}${this.configService.get<string>('naver.callback')}`;
  }
}
