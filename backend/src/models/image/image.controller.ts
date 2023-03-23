import { Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ImageServeService, ImageUploadService } from './services';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionGuard } from '../../common/guards/session/session.guard';
import { CreateFileValidationPipe } from '../../common/pipes';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { Response } from 'express';

@Controller('image')
export class ImageController {
  constructor(private imageServeService: ImageServeService, private imageUploadService: ImageUploadService) {}

  @Post('/')
  @UseGuards(SessionGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.IMAGE_STORAGE_PATH, // fixme: 쿨하지는 않은데 어쩔 수 없는듯...
        filename: (req, file, callback) => {
          const extension = file.originalname.split('.').pop();
          const extensionResult = extension === 'jpg' || extension === 'jpeg' ? '.jpg' : '.png';
          callback(null, randomStringGenerator() + extensionResult);
        },
      }),
    })
  )
  async uploadImage(
    @UploadedFile(CreateFileValidationPipe(5000, RegExp('^image\\/(jpeg|png)$'))) file: Express.Multer.File
  ) {
    return await this.imageUploadService.getSavedFileURL(file);
  }

  /**
   * 이 방법 말고 좋은 방법이 있을 것임.
   */
  @Get('/:filename')
  @UseGuards(SessionGuard)
  serveImage(@Param('filename') filename: string, @Res() res: Response): void {
    return this.imageServeService.serveImage(filename, res);
  }
}
