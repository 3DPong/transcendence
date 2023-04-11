import { IsEnum, IsNumber } from 'class-validator';
import { RelationStatus } from '../../../../common/enums/relationStatus.enum';

export class UserRelationDto {
  @IsNumber()
  target_id: number;
  @IsEnum(RelationStatus)
  status: RelationStatus;
}
