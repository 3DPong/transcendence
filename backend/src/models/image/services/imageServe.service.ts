import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { ImageConfigService } from '../../../config/image/config.service';
import { Response } from 'express';

@Injectable()
export class ImageServeService {
  constructor(private imageConfigService: ImageConfigService) {}
  serveImage(filename: string, res: Response) {
    const filePath = __dirname + '/../../../../' + this.imageConfigService.StoragePath + '/' + filename;
    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
      res.sendFile(filePath, { root: '/' });
    } else {
      throw new NotFoundException('not exists');
    }
  }
}
