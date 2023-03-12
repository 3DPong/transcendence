import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../user/entities';
import { ChatChannel } from './chatChannel.entity';

@Entity()
export class DmChannel {
  @PrimaryColumn({ type: 'int' })
  first_user_id: number;

  @PrimaryColumn({ type: 'int' })
  second_user_id: number;

  @Column({ type: 'int' })
  channel_id: number;

  @ManyToOne(() => User, (user) => user.dmList1)
  @JoinColumn({ name: 'first_user_id' })
  first_user: User;

  @ManyToOne(() => User, (user) => user.dmList2)
  @JoinColumn({ name: 'second_user_id' })
  second_user: User;

  @ManyToOne(() => ChatChannel, (channel) => channel.dmList)
  @JoinColumn({ name: 'channel_id' })
  channel: ChatChannel;
}
