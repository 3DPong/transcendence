import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageServeService, ImageUploadService } from './services';
import { JwtGuard } from '../../common/guards/jwt/jwt.guard';
import { ImageConfigModule } from '../../config/image/config.module';
import { TokenUserGuard } from '../../common/guards/tokenUser/tokenUser.guard';
import { TokenUserStrategy } from '../../common/guards/tokenUser/tokenUser.strategy';
import { JwtStrategy } from '../../common/guards/jwt/jwt.strategy';
import { JwtConfigService } from '../../config/jwt/config.service';

@Module({
  imports: [ImageConfigModule],
  controllers: [ImageController],
  providers: [
    ImageUploadService,
    ImageServeService,
    JwtGuard,
    TokenUserGuard,
    TokenUserStrategy,
    JwtStrategy,
    JwtConfigService,
  ],
})
export class ImageModule {}
