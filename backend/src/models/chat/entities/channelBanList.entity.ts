import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../user/entities';
import { ChatChannel } from './chatChannel.entity';
import { Factory } from 'nestjs-seeder';

export enum BanStatus {
  Ban = 0,
  NoneBan,
  PassedBan
}

@Entity()
export class ChannelBanList {
  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @PrimaryColumn({ type: 'int' })
  user_id: number;

  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @PrimaryColumn({ type: 'int' })
  channel_id: number;

  @Factory((faker) => faker.date.future())
  @Column({ type: 'timestamp' })
  end_at: Date;

  @ManyToOne(() => User, (user) => user.bannedChannels)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatChannel, (channel) => channel.bannedUsers)
  @JoinColumn({ name: 'channel_id' })
  channel: ChatChannel;
}
