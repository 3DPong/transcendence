import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../entities';
import { GameGateway } from './game.gateway';
import { GameService } from './services';
import { GameDataMaker } from './services';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigModule } from 'src/config/jwt/config.module';
import { JwtConfigService } from 'src/config/jwt/config.service';
import { User } from 'src/models/user/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, User]),
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      useFactory: async (jwtConfigService: JwtConfigService) => ({
        secret: jwtConfigService.secret,
        signOptions: { expiresIn: jwtConfigService.expiresIn, algorithm: 'HS256', issuer: '3DPong' },
      }),
      inject: [JwtConfigService],
    }),
  ],
  providers: [GameGateway, GameService, GameDataMaker],
})
export class GameModule {}
