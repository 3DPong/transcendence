import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities';
import { Factory } from 'nestjs-seeder';
import { GameType, RoomType } from '../enum/GameEnum';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  match_id: number;

  @Factory((faker) => faker.helpers.arrayElement([GameType.SPECIAL, GameType.NORMAL]))
  @Column({ type: 'enum', enum: GameType, default: GameType.NORMAL })
  game_type: GameType;

  @Factory((faker) => faker.helpers.arrayElement([RoomType.CHAT, RoomType.RANDOM]))
  @Column({ type: 'enum', enum: RoomType, default: RoomType.RANDOM })
  match_type: RoomType;

  @Factory((faker) => faker.datatype.number({ min: 0, max: 20 }))
  @Column({ type: 'int8', default: 0 })
  left_score: number;

  @Factory((faker) => faker.datatype.number({ min: 0, max: 20 }))
  @Column({ type: 'int8', default: 0 })
  right_score: number;

  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @Column({ type: 'int', default: 0 })
  left_player: number;

  @ManyToOne(() => User, (user) => user.leftPlayerGames)
  @JoinColumn({ name: 'left_player' })
  lPlayer: User;

  @Factory((faker) => faker.datatype.number({ min: 1, max: 100 }))
  @Column({ type: 'int' })
  right_player: number;

  @ManyToOne(() => User, (user) => user.rightPlayerGames)
  @JoinColumn({ name: 'right_player' })
  rPlayer: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
