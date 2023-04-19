import { Module } from '@nestjs/common';
import { NotifySocketService } from './services';
import { NotifySocketGateway } from './notifySocket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../user/entities';
import { NotifierModule } from '../../notifier/notifier.module';
import { SocketMapService } from '../../../providers/redis/socketMap.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigModule } from '../../../config/jwt/config.module';
import { JwtConfigService } from '../../../config/jwt/config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    NotifierModule,
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      useFactory: async (jwtConfigService: JwtConfigService) => ({
        secret: jwtConfigService.secret,
        signOptions: { expiresIn: jwtConfigService.expiresIn, algorithm: 'HS256', issuer: '3DPong' },
      }),
      inject: [JwtConfigService],
    }),
  ],
  providers: [NotifySocketGateway, NotifySocketService, SocketMapService],
})
export class NotifySocketModule {}
