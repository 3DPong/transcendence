import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { FtConfigModule } from '../../config/ft/config.module';
import { FtGuard } from '../../common/guards/ft/ft.guard';
import { FtStrategy } from '../../common/guards/ft/ft.strategy';
import { TwoFactorGuard } from '../../common/guards/twoFactor/twoFactor.guard';
import { TwoFactorStrategy } from '../../common/guards/twoFactor/twoFactor.strategy';
import { OtpModule } from '../otp/otp.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigModule } from '../../config/jwt/config.module';
import { JwtConfigService } from '../../config/jwt/config.service';
import { EmailModule } from '../email/email.module';
import { KakaoStrategy } from '../../common/guards/kakao/kakao.strategy';
import { KakaoGuard } from '../../common/guards/kakao/kakao.guard';
import { EmailConfigModule } from '../../config/email/config.module';
import { KakaoConfigModule } from '../../config/kakao/config.module';
import { GoogleConfigModule } from '../../config/google/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FtConfigModule,
    KakaoConfigModule,
    GoogleConfigModule,
    EmailConfigModule,
    OtpModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      useFactory: async (jwtConfigService: JwtConfigService) => ({
        secret: jwtConfigService.secret,
        signOptions: { expiresIn: jwtConfigService.expiresIn, algorithm: 'HS256', issuer: '3DPong' },
      }),
      inject: [JwtConfigService],
    }),
    JwtConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, FtGuard, FtStrategy, TwoFactorGuard, TwoFactorStrategy, KakaoGuard, KakaoStrategy],
})
export class AuthModule {}
