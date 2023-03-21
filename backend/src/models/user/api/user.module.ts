import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserRelation } from '../entities';
import { SessionGuard } from '../../../common/guards/session/session.guard';
import { SessionStrategy } from '../../../common/guards/session/session.strategy';
import { UserCreationGuard } from '../../../common/guards/signup.guard.ts/userCreation.guard';
import { UserCreationStrategy } from '../../../common/guards/signup.guard.ts/userCreation.strategy';
import { UserRelationController } from './userRelation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRelation])],
  controllers: [UserController, UserRelationController],
  providers: [UserService, SessionGuard, SessionStrategy, UserCreationGuard, UserCreationStrategy],
})
export class UserModule {}
