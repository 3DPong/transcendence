import { Module } from '@nestjs/common';
import { OtpConfigModule } from '../../config/otp/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { OtpService } from './otp.service';

@Module({
  imports: [OtpConfigModule, TypeOrmModule.forFeature([User])],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
