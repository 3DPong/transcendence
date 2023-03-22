import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app/config.service';

@Injectable()
export class ImageUploadService {
  constructor(private appConfigService: AppConfigService) {}
  async getSavedFileURL(img: Express.Multer.File): Promise<string> {
    return `http://${this.appConfigService.host}:${this.appConfigService.port}/image/${img.filename}`;
  }
}
