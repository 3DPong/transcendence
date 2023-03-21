import { RelationStatus } from '../../entities';
import { UserRelationDto } from './userRelationDto';

export class UpdateUserRelationResDto implements UserRelationDto {
  target_id: number;
  status: RelationStatus;
}
