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

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FtConfigModule,
    OtpModule,
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
  providers: [AuthService, FtGuard, FtStrategy, TwoFactorGuard, TwoFactorStrategy],
})
export class AuthModule {}
