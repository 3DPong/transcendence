import { RelationStatus } from '../../../../common/enums/relationStatus.enum';
import { User } from '../../entities';

export class SearchedUser {
  constructor(user: User) {
    this.user_id = user.user_id;
    this.nickname = user.nickname;
    this.profile_url = user.profile_url;
    this.status = user.relatedOf[0]?.status || RelationStatus.NONE;
  }
  user_id: number;
  nickname: string;
  profile_url: string;
  status: RelationStatus;
}

export class SearchUserResDto {
  users: SearchedUser[];
}
