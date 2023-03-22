import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { SessionService } from '../../common/session/session.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [DevController],
  providers: [DevService, SessionService],
})
export class DevModule {}

@Module({})
export class EmptyModule {}
