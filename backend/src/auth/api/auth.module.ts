import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { FtConfigModule } from '../../config/ft/config.module';
import { FtGuard } from '../../common/guards/ft/ft.guard';
import { FtStrategy } from '../../common/guards/ft/ft.strategy';
import { SessionService } from '../../common/session/session.service';
import { TwoFactorGuard } from '../../common/guards/twoFactor/twoFactor.guard';
import { TwoFactorStrategy } from '../../common/guards/twoFactor/twoFactor.strategy';
import { OtpService } from './services/otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FtConfigModule],
  controllers: [AuthController],
  providers: [AuthService, OtpService, FtGuard, FtStrategy, SessionService, TwoFactorGuard, TwoFactorStrategy],
})
export class AuthModule {}
