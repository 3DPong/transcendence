import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../user/entities';
import { ChatChannel } from './chatChannel.entity';
import { Factory } from 'nestjs-seeder';

export enum MuteStatus {
  Mute = 0,
  NoneMute,
  PassedMute,
}

@Entity()
export class ChannelMuteList {
  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @PrimaryColumn({ type: 'int' })
  user_id: number;

  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @PrimaryColumn({ type: 'int' })
  channel_id: number;

  @Factory((faker) => faker.date.future())
  @Column({ type: 'timestamp' })
  end_at: Date;

  @ManyToOne(() => User, (user) => user.mutedChannels)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatChannel, (channel) => channel.mutedUsers)
  @JoinColumn({ name: 'channel_id' })
  channel: ChatChannel;
}
