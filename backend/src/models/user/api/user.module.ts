import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserRelation } from '../entities';
import { JwtGuard } from '../../../common/guards/jwt/jwt.guard';
import { UserCreationGuard } from '../../../common/guards/userCreation/userCreation.guard';
import { UserCreationStrategy } from '../../../common/guards/userCreation/userCreation.strategy';
import { UserRelationController } from './userRelation.controller';
import { UserRelationService } from './services/userRelation.service';
import { SessionService } from '../../../common/session/session.service';
import { TwoFactorService } from './services/twoFactor.service';
import { OtpModule } from '../../../auth/otp/otp.module';
import { JwtStrategy } from '../../../common/guards/jwt/jwt.strategy';
import { JwtConfigModule } from '../../../config/jwt/config.module';
import { NotifierModule } from '../../notifier/notifier.module';
import { Match } from '../../game/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRelation, Match]), OtpModule, JwtConfigModule, NotifierModule],
  controllers: [UserController, UserRelationController],
  providers: [
    UserService,
    UserRelationService,
    SessionService,
    JwtGuard,
    JwtStrategy,
    UserCreationGuard,
    UserCreationStrategy,
    TwoFactorService,
  ],
})
export class UserModule {}
