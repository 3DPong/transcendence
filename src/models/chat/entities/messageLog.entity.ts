import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';
import { ChatChannel } from './chatChannel.entity';

@Entity()
export class MessageLog {
  @PrimaryGeneratedColumn()
  message_id: number;

  @Column({ type: 'int' })
  channel_id: number;

  @ManyToOne(() => ChatChannel, (chatChannel) => chatChannel.messages)
  @JoinColumn({ name: 'channel_id' })
  channel: ChatChannel;

  @Column({ type: 'varchar', length: 500 })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Timestamp;
}
