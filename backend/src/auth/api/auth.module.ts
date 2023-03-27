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
import { SessionService } from '../../common/session/session.service';
import { OtpModule } from '../../common/otp/otp.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FtConfigModule, OtpModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService, FtGuard, FtStrategy, TwoFactorGuard, TwoFactorStrategy],
})
export class AuthModule {}
