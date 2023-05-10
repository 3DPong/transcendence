import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { EmailConfigModule } from 'src/config/email/config.module';

@Module({
  imports: [
    EmailConfigModule, TypeOrmModule.forFeature([User])
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
