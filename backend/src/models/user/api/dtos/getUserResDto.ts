import { User } from '../../entities';

export class GetUserResDto {
  constructor(user: User) {
    this.user_id = user.user_id;
    this.nickname = user.nickname;
    this.profile_url = user.profile_url;
    this.wins = user.wins;
    this.losses = user.losses;
    this.total = user.total;
    this.level = user.level;
  }
  user_id: number;
  nickname: string;
  profile_url: string;
  wins: number;
  losses: number;
  total: number;
  level: number;
}
