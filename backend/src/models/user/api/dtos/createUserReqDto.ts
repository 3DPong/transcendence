import { IsUrl } from 'class-validator';

export class CreateUserReqDto {
  nickname: string;
  @IsUrl()
  profile_url: string;
}
