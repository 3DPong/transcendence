import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageUploadService {
  async getSavedFileURL(img: Express.Multer.File): Promise<string> {
    return `/api/image/${img.filename}`;
  }
}
