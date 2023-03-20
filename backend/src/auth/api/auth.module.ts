import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { FtConfigModule } from '../../config/ft/config.module';
import { FtGuard } from '../../common/guards/ft/ft.guard';
import { FtStrategy } from '../../common/guards/ft/ft.strategy';
import { SessionService } from '../../common/session/session.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FtConfigModule],
  controllers: [AuthController],
  providers: [AuthService, FtGuard, FtStrategy, SessionService],
})
export class AuthModule {}
