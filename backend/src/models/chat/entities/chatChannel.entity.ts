import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities';
import { ChannelUser } from './channelUser.entity';
import { MessageLog } from './messageLog.entity';
import { DmChannel } from './dmChannel.entity';
import { ChannelBanList } from './channelBanList.entity';
import { ChannelMuteList } from './channeMuteList.entity';
import { Factory } from 'nestjs-seeder';

export enum ChannelType {
  PRIVATE = 'private',
  PROTECTED = 'protected',
  PUBLIC = 'public',
  DM = 'dm',
}

@Entity()
export class ChatChannel {
  @PrimaryGeneratedColumn()
  channel_id: number;

  @Factory((faker) => faker.name.fullName())
  @Column({ type: 'varchar', length: 30, nullable: false })
  name: string;

  @Factory((faker) => faker.helpers.arrayElement(['private', 'protected', 'public', 'dm']))
  @Column({ type: 'enum', enum: ChannelType, default: ChannelType.PUBLIC })
  type: ChannelType;

  @ManyToOne(() => User, (user) => user.ownChannels)
  @JoinColumn({ name: 'owner_id' })
  owner: User;
  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @Column({ type: 'int' })
  owner_id: number;

  @Factory((faker) => faker.helpers.arrayElement([faker.internet.password(50), null]))
  @Column({ type: 'varchar', length: 100, nullable: true }) // encrypt 이후 길이를 알아야함
  password: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Factory((faker) => faker.helpers.arrayElement([null, faker.date.future()]))
  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;

  @OneToMany(() => ChannelUser, (cu) => cu.channel, { eager: true })
  users: ChannelUser[];

  @OneToMany(() => MessageLog, (msgLog) => msgLog.channel)
  messages: MessageLog[];

  @OneToMany(() => DmChannel, (dm) => dm.channel)
  dmList: DmChannel[];

  @OneToMany(() => ChannelBanList, (ban) => ban.channel, { eager: true })
  bannedUsers: ChannelBanList[];

  @OneToMany(() => ChannelMuteList, (mute) => mute.channel, { eager: false })
  mutedUsers: ChannelMuteList[];
}
