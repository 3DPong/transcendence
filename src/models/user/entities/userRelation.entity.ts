import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

export enum RelationStatus {
  FRIEND = 'friend',
  BLOCK = 'block',
}

@Entity()
export class UserRelation {
  @PrimaryColumn({ type: 'int' })
  user_id: number;
  @ManyToOne(() => User, (user) => user.relationships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @PrimaryColumn({ type: 'int' })
  target_id: number;
  @ManyToOne(() => User, (user) => user.relatedOf)
  @JoinColumn({ name: 'target_id' })
  target: User;

  @Column({ type: 'enum', enum: RelationStatus, nullable: false })
  status: RelationStatus;
}
