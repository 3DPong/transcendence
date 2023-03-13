import { DatabaseType } from 'typeorm';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { PostgresConfigService } from '../../../config/database/postgres/config.service';
import { User, UserRelation } from '../../../models/user/entities';
import { Match } from '../../../models/game/entities';
import {
  ChannelBanList,
  ChannelMuteList,
  ChannelUser,
  ChatChannel,
  DmChannel,
  MessageLog,
} from '../../../models/chat/entities';
import { PostgresConfigModule } from '../../../config/database/postgres/config.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [PostgresConfigModule],
      useFactory: async (postgresConfigService: PostgresConfigService) => ({
        type: 'postgres' as DatabaseType,
        host: postgresConfigService.host,
        port: postgresConfigService.port,
        username: postgresConfigService.username,
        password: postgresConfigService.password,
        database: postgresConfigService.database,
        entities: [
          User,
          UserRelation,
          Match,
          ChatChannel,
          DmChannel,
          ChannelUser,
          ChannelBanList,
          ChannelMuteList,
          MessageLog,
        ],
        synchronize: true,
        //        entities: [__dirname + '/../../../*/*{.entity.ts,.entity.js}'],
      }),
      inject: [PostgresConfigService],
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class PostgresDatabaseProviderModule {}
