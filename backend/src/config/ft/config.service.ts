import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class FtConfigService {
  constructor(private configService: ConfigService) {}

  get client(): string {
    return this.configService.get<string>('ft.client');
  }

  get secret(): string {
    return this.configService.get<string>('ft.secret');
  }

  get callback(): string {
    return `http://${this.configService.get<string>('EXTERNAL_HOST')}:${this.configService.get<number>(
      'EXTERNAL_PORT'
    )}${this.configService.get<string>('ft.callback')}`;
  }
}
