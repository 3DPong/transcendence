import { UserRelationDto } from './userRelation.dto';
import { RelationStatus } from '../../../../common/enums/relationStatus.enum';

export class UpdateUserRelationResDto implements UserRelationDto {
  target_id: number;
  status: RelationStatus;
}
