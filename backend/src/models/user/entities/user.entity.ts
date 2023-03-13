import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  Unique,
} from 'typeorm';
import { UserRelation } from './userRelation.entity';
import { ChatChannel, ChannelUser, DmChannel, ChannelMuteList, ChannelBanList } from '../../chat/entities';
import { Match } from '../../game/entities';

@Entity()
@Unique(['nickname'])
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  nickname: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  profile_url: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Timestamp;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Timestamp;

  @Column({ type: 'int', default: 0, nullable: false })
  wins: number;

  @Column({ type: 'int', default: 0, nullable: false })
  losses: number;

  @Column({ type: 'int', default: 0, nullable: false })
  total: number;

  @Column({ type: 'float', default: 0, nullable: false })
  level: number;

  @Column({ type: 'boolean', default: false, nullable: false })
  two_factor: boolean;

  // 추가로 authenticator 반영해야함

  @OneToMany(() => UserRelation, (friendship) => friendship.user)
  relationships: UserRelation[];

  @OneToMany(() => UserRelation, (friendship) => friendship.target)
  relatedOf: UserRelation[];

  @OneToMany(() => ChatChannel, (chatChannel) => chatChannel.owner)
  ownChannels: ChatChannel[];

  @OneToMany(() => ChannelUser, (channelUser) => channelUser.user)
  joinChannels: ChannelUser[];

  @OneToMany(() => DmChannel, (dm) => dm.first_user)
  dmList1: DmChannel[];

  @OneToMany(() => DmChannel, (dm) => dm.second_user)
  dmList2: DmChannel[];

  @OneToMany(() => ChannelBanList, (banList) => banList.user)
  bannedChannels: ChannelBanList[];

  @OneToMany(() => ChannelMuteList, (muteList) => muteList.user)
  mutedChannels: ChannelMuteList[];

  @OneToMany(() => Match, (match) => match.lPlayer)
  leftPlayerGames: Match[];

  @OneToMany(() => Match, (match) => match.rPlayer)
  rightPlayerGames: Match[];
}
