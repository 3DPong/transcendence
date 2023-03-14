import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatChannel } from './chatChannel.entity';
import { Factory } from 'nestjs-seeder';

@Entity()
export class MessageLog {
  @PrimaryGeneratedColumn()
  message_id: number;

  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @Column({ type: 'int' })
  channel_id: number;

  @ManyToOne(() => ChatChannel, (chatChannel) => chatChannel.messages)
  @JoinColumn({ name: 'channel_id' })
  channel: ChatChannel;

  @Factory((faker) => faker.lorem.sentence())
  @Column({ type: 'varchar', length: 500 })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
