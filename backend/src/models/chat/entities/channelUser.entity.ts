import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ChatChannel } from './chatChannel.entity';
import { User } from '../../user/entities';
import { Factory } from 'nestjs-seeder';

export enum ChannelUserRoles {
  USER = 'user',
  ADMIN = 'admin',
  OWNER = 'owner',
}

@Entity()
export class ChannelUser {
  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @PrimaryColumn({ type: 'int' })
  channel_id: number;

  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @PrimaryColumn({ type: 'int' })
  user_id: number;

  @Factory((faker) => faker.helpers.arrayElement(['user', 'admin']))
  @Column({ type: 'enum', enum: ChannelUserRoles, default: ChannelUserRoles.USER })
  role: ChannelUserRoles;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Factory((faker) => faker.helpers.arrayElement([null, faker.date.future()]))
  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;

  @ManyToOne(() => ChatChannel, (channel) => channel.users)
  @JoinColumn({ name: 'channel_id' })
  channel: ChatChannel;

  @ManyToOne(() => User, (user) => user.joinChannels, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
