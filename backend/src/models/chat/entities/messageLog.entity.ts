import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatChannel } from './chatChannel.entity';
import { Factory } from 'nestjs-seeder';

export enum MessageType {
  MESSAGE = 'message',
  GAME = 'game',
}

@Entity()
export class MessageLog {
  @PrimaryGeneratedColumn()
  message_id: number;

  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @Column({ type: 'int' })
  channel_id: number;

  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @Column({ type: 'int' })
  user_id: number;

  @Factory((faker) => faker.helpers.arrayElement(['message', 'game']))
  @Column({ type: 'enum', enum: MessageType, default: MessageType.MESSAGE })
  type: MessageType;

  @ManyToOne(() => ChatChannel, (chatChannel) => chatChannel.messages)
  @JoinColumn({ name: 'channel_id' })
  channel: ChatChannel;

  @Factory((faker) => faker.lorem.sentence())
  @Column({ type: 'varchar', length: 500, nullable: true })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
