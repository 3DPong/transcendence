import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { FtStrategy } from '../../common/guards/ft/ft.strategy';
import { FtConfigModule } from '../../config/ft/config.module';
import { FtGuard } from '../../common/guards/ft/ft.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FtConfigModule],
  controllers: [AuthController],
  providers: [AuthService, FtGuard, FtStrategy],
})
export class AuthModule {}