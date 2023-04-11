import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageServeService, ImageUploadService } from './services';
import { JwtGuard } from '../../common/guards/jwt/jwt.guard';
import { ImageConfigModule } from '../../config/image/config.module';

@Module({
  imports: [ImageConfigModule],
  controllers: [ImageController],
  providers: [ImageUploadService, ImageServeService, JwtGuard],
})
export class ImageModule {}
