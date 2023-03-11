import { Column, Entity, JoinColumn, ManyToOne, Timestamp } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { ChatChannel } from './chatChannel.entity';

@Entity()
export class ChannelBanList {
  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  channel_id: number;

  @Column({ type: 'timestamp' })
  end_at: Timestamp;

  @ManyToOne(() => User, (user) => user.bannedChannels)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatChannel, (channel) => channel.bannedUsers)
  @JoinColumn({ name: 'channel_id' })
  channel: ChatChannel;
}
