import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities';
import { Factory } from 'nestjs-seeder';

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

  @Factory((faker) => faker.helpers.arrayElement([GameType.ITEM, GameType.NORMAL]))
  @Column({ type: 'enum', enum: GameType, default: GameType.NORMAL })
  game_type: GameType;

  @Factory((faker) => faker.helpers.arrayElement([MapType.MAP_BLOCK, MapType.DEFAULT]))
  @Column({ type: 'enum', enum: MapType, default: MapType.DEFAULT })
  map_type: MapType;

  @Factory((faker) => faker.datatype.number({ min: 0, max: 10 }))
  @Column({ type: 'int8', default: 0 })
  left_score: number;

  @Factory((faker) => faker.datatype.number({ min: 0, max: 10 }))
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
