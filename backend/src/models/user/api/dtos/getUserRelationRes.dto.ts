import { UserStatusEnum } from '../../../../common/enums';
import { RelationStatus } from '../../../../common/enums/relationStatus.enum';

export class UserRelationAndInfo {
  target_id: number;
  nickname: string;
  profile_url: string;
  relation: RelationStatus;
  status: UserStatusEnum;
}

export class GetUserRelationResDto {
  relations: UserRelationAndInfo[];
}
