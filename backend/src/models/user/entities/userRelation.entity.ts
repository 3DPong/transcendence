import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Factory } from 'nestjs-seeder';
import { RelationStatus } from '../../../common/enums/relationStatus.enum';

@Entity()
export class UserRelation {
  @Factory((faker) => faker.helpers.unique(faker.datatype.number, [{ min: 1, max: 100 }]))
  @PrimaryColumn({ type: 'int' })
  user_id: number;
  @ManyToOne(() => User, (user) => user.relationships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Factory((faker) => faker.helpers.unique(faker.datatype.number, [{ min: 1, max: 100 }]))
  @PrimaryColumn({ type: 'int' })
  target_id: number;
  @ManyToOne(() => User, (user) => user.relatedOf)
  @JoinColumn({ name: 'target_id' })
  target: User;

  @Factory((faker) => faker.helpers.arrayElement([RelationStatus.BLOCK, RelationStatus.FRIEND]))
  @Column({ type: 'enum', enum: RelationStatus, nullable: false })
  status: RelationStatus;
}
