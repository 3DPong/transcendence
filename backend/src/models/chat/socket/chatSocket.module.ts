import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSocketGateway } from './chatSocket.gateway';
import { ChatSocketService } from './services';
import { ChannelBanList, ChannelMuteList, ChannelUser, ChatChannel, DmChannel, MessageLog } from '../entities';
import { UserRelation } from 'src/models/user/entities';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigModule } from 'src/config/jwt/config.module';
import { JwtConfigService } from 'src/config/jwt/config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatChannel, ChannelUser, DmChannel, MessageLog, ChannelBanList, ChannelMuteList, UserRelation]),
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      useFactory: async (jwtConfigService: JwtConfigService) => ({
        secret: jwtConfigService.secret,
        signOptions: { expiresIn: jwtConfigService.expiresIn, algorithm: 'HS256', issuer: '3DPong' },
      }),
      inject: [JwtConfigService],
    }),
  ],
  providers: [ChatSocketGateway, ChatSocketService],
  exports: [ChatSocketService, ChatSocketGateway],
})
export class ChatSocketModule {}
