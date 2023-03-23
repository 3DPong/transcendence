import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageServeService, ImageUploadService } from './services';
import { SessionGuard } from '../../common/guards/session/session.guard';
import { SessionStrategy } from '../../common/guards/session/session.strategy';
import { ImageConfigModule } from '../../config/image/config.module';

@Module({
  imports: [ImageConfigModule],
  controllers: [ImageController],
  providers: [ImageUploadService, ImageServeService, SessionGuard, SessionStrategy],
})
export class ImageModule {}
