import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { PostgresDatabaseProviderModule } from '../../providers/database/postgres/provider.module';
import { User, UserRelation } from '../../models/user/entities';
import {
  ChannelBanList,
  ChannelMuteList,
  ChannelUser,
  ChatChannel,
  DmChannel,
  MessageLog,
} from '../../models/chat/entities';
import { Match } from '../../models/game/entities';
import {
  ChannelBanListSeeder,
  ChannelMuteListSeeder,
  ChannelUserSeeder,
  ChatChannelSeeder,
  DmChannelSeeder,
  MatchSeeder,
  MessageLogSeeder,
  UserRelationSeeder,
  UserSeeder,
  CorrectionSeeder,
} from './seeders';

seeder({
  imports: [
    PostgresDatabaseProviderModule,
    TypeOrmModule.forFeature([
      User,
      UserRelation,
      ChatChannel,
      ChannelUser,
      ChannelMuteList,
      ChannelBanList,
      DmChannel,
      MessageLog,
      Match,
    ]),
  ],
}).run([
  UserSeeder,
  UserRelationSeeder,
  ChatChannelSeeder,
  ChannelUserSeeder,
  ChannelBanListSeeder,
  ChannelMuteListSeeder,
  DmChannelSeeder,
  MessageLogSeeder,
  MatchSeeder,
  CorrectionSeeder,
]);
