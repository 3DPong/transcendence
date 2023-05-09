import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { EmailConfigModule } from 'src/config/email/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailConfigModule
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
