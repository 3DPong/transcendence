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
import { Factory } from 'nestjs-seeder';
import { UserStatusEnum } from '../../../common/enums';

@Entity()
@Unique(['nickname', 'email'])
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Factory((faker) => faker.helpers.unique(faker.word.noun))
  @Column({ type: 'varchar', length: 20, unique: true })
  nickname: string;

  @Factory((faker) => faker.helpers.unique(faker.internet.email))
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;
  
  @Factory((faker) => faker.helpers.arrayElement([faker.internet.password(50), null]))
  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Factory((faker) => faker.image.people())
  @Column({ type: 'varchar', length: 150 })
  profile_url: string;

  @Column({ type: 'enum', enum: UserStatusEnum, default: UserStatusEnum.OFFLINE })
  status: UserStatusEnum;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Timestamp;

  @Factory((faker) => faker.helpers.arrayElement([null, faker.date.future()]))
  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Timestamp;

  @Factory((faker) => faker.datatype.number({ min: 0, max: 100 }))
  @Column({ type: 'int', default: 0, nullable: false })
  wins: number;

  @Factory((faker) => faker.datatype.number({ min: 0, max: 100 }))
  @Column({ type: 'int', default: 0, nullable: false })
  losses: number;

  @Factory((faker) => faker.datatype.number({ min: 0, max: 200 }))
  @Column({ type: 'int', default: 0, nullable: false })
  total: number;

  @Factory((faker) => faker.datatype.number({ min: 0, max: 200 }))
  @Column({ type: 'float', default: 0, nullable: false })
  level: number;

  @Factory((faker) => faker.datatype.boolean())
  @Column({ type: 'boolean', default: false, nullable: false })
  two_factor: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  two_factor_secret: string;

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
