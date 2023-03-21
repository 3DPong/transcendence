import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities';
import { SessionGuard } from '../../../common/guards/session/session.guard';
import { SessionStrategy } from '../../../common/guards/session/session.strategy';
import { UserCreationGuard } from '../../../common/guards/signup.guard.ts/userCreation.guard';
import { UserCreationStrategy } from '../../../common/guards/signup.guard.ts/userCreation.strategy';
import { SessionService } from '../../../common/session/session.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, SessionGuard, SessionStrategy, UserCreationGuard, UserCreationStrategy, SessionService],
})
export class UserModule {}
