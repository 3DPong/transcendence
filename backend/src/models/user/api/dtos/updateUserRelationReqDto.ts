import { UserRelationDto } from './userRelationDto';
import { RelationStatus } from '../../../../common/enums/relationStatus.enum';

export class UpdateUserRelationReqDto implements UserRelationDto {
  target_id: number;
  status: RelationStatus;
}
