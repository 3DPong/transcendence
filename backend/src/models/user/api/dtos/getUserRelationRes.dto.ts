export class UserRelationAndInfo {
  target_id: number;
  status: string;
  nickname: string;
  profile_url: string;
}

export class GetUserRelationResDto {
  relations: UserRelationAndInfo[];
}
