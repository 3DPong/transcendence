import { UserStatusEnum } from '../enums';

export interface UserUpdateDto {
  user_id: number;
  nickname: string;
  profile_url: string;
  status: UserStatusEnum;
}
