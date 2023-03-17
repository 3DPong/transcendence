import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';
import { User } from '../../user/entities';

export enum GameType {
  NORMAL = 'NORMAL',
  ITEM = 'ITEM',
}

export enum MapType {
  DEFAULT = 'DEFAULT',
  MAP_BLOCK = 'BLOCK', // NOTE:  아직 정한거 아님
}

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  match_id: number;

  @Column({ type: 'enum', enum: GameType, default: GameType.NORMAL })
  game_type: GameType;

  @Column({ type: 'enum', enum: MapType, default: MapType.DEFAULT })
  map_type: MapType;

  @Column({ type: 'int8', default: 0 })
  left_score: number;

  @Column({ type: 'int8', default: 0 })
  right_score: number;

  @Column({ type: 'int', default: 0 })
  left_player: number;
  @ManyToOne(() => User, (user) => user.leftPlayerGames)
  @JoinColumn({ name: 'left_player' })
  lPlayer: User;

  @Column({ type: 'int' })
  right_player: number;
  @ManyToOne(() => User, (user) => user.rightPlayerGames)
  @JoinColumn({ name: 'right_player' })
  rPlayer: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Timestamp;
}
