import { UserRelationDto } from './userRelation.dto';
import { RelationStatus } from '../../../../common/enums/relationStatus.enum';
import { IsEnum } from 'class-validator';

export class UpdateUserRelationReqDto implements UserRelationDto {
  target_id: number;
  @IsEnum(RelationStatus, {
    message: 'Invalid relation status',
  })
  status: RelationStatus;
}
