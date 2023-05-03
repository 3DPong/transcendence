import { RelationStatus } from '../../../../common/enums/relationStatus.enum';
import { User } from '../../entities';

export class SearchedUser {
  constructor(user: User, status: RelationStatus) {
    this.user_id = user.user_id;
    this.nickname = user.nickname;
    this.profile_url = user.profile_url;
    this.relationWithMe = status;
  }

  user_id: number;
  nickname: string;
  profile_url: string;
  relationWithMe: RelationStatus;
}

export class SearchUserResDto {
  users: SearchedUser[];
}
