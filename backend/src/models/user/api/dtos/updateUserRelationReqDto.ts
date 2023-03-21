import { RelationStatus } from '../../entities';
import { UserRelationDto } from './userRelationDto';

export class UpdateUserRelationReqDto implements UserRelationDto {
  target_id: number;
  status: RelationStatus;
}
