import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class ImageConfigService {
  constructor(private configService: ConfigService) {}

  get StoragePath(): string {
    return this.configService.get<string>('image.storagePath');
  }
}
