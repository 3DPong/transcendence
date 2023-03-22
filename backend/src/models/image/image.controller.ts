import { Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ImageServeService, ImageUploadService } from './services';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionGuard } from '../../common/guards/session/session.guard';
import { CreateFileValidationPipe } from '../../common/pipes';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { Response } from 'express';
import { ImageConfigService } from '../../config/image/config.service';

@Controller('image')
export class ImageController {
  constructor(
    private imageServeService: ImageServeService,
    private imageUploadService: ImageUploadService,
    private imageConfigService: ImageConfigService
  ) {}

  @Post('/')
  @UseGuards(SessionGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.IMAGE_STORAGE_PATH, // fixme: 쿨하지는 않은데 어쩔 수 없는듯...
        filename: (req, file, callback) => {
          callback(null, randomStringGenerator() + '.jpg');
        },
      }),
    })
  )
  async uploadImage(@UploadedFile(CreateFileValidationPipe(5000, 'image/jpeg')) file: Express.Multer.File) {
    return await this.imageUploadService.getSavedFileURL(file);
  }

  /**
   * 이 방법 말고 좋은 방법이 있을 것임.
   */
  @Get('/:filename')
  @UseGuards(SessionGuard)
  async serveImage(@Param('filename') filename: string, @Res() res: Response) {
    res.sendFile(this.imageConfigService.StoragePath + filename, { root: __dirname + '/../../../' }); // fixme: 조금 더 쿨한 방법으로 해결할 수 있을까?
  }
}
