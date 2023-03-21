import { RelationStatus } from '../../entities';
import { IsEnum, IsNumber } from 'class-validator';

export class UserRelationDto {
  @IsNumber()
  target_id: number;
  @IsEnum(RelationStatus)
  status: RelationStatus;
}
