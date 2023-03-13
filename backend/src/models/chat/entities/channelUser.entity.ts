import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Timestamp,
} from 'typeorm';
import { ChatChannel } from './chatChannel.entity';
import { User } from '../../user/entities';

export enum ChannelUserRoles {
  USER = 'user',
  ADMIN = 'ADMIN',
}

@Entity()
export class ChannelUser {
  @PrimaryColumn({ type: 'int' })
  channel_id: number;

  @PrimaryColumn({ type: 'int' })
  user_id: number;

  @Column({ type: 'enum', enum: ChannelUserRoles, default: ChannelUserRoles.USER })
  role: ChannelUserRoles;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Timestamp;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Timestamp;

  @ManyToOne(() => ChatChannel, (channel) => channel.users)
  @JoinColumn({ name: 'channel_id' })
  channel: ChatChannel;

  @ManyToOne(() => User, (user) => user.joinChannels)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
