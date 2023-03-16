import { IsBoolean, IsNumber, IsUrl } from 'class-validator';

export class UpdateUserReqDto {
  @IsNumber()
  user_id: number;
  nickname: string;
  @IsUrl()
  profile_url: string;

  @IsBoolean()
  two_factor: boolean;
}
