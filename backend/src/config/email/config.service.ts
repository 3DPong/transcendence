import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class MailConfigService {
  constructor(private configService: ConfigService) {}

  get email(): string {
    return this.configService.get<string>('email.id');
  }

  get password(): string {
    return this.configService.get<string>('email.pass');
  }

  get callback(): string {
    return `http://${this.configService.get<string>('EXTERNAL_HOST')}:${this.configService.get<number>(
      'EXTERNAL_PORT'
    )}${this.configService.get<string>('email.callback')}`;
  }
}
