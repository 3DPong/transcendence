import { IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class UpdateUserReqDto {
  nickname: string;
  @IsUrl()
  profile_url: string;

  @IsOptional()
  @IsBoolean()
  two_factor?: boolean;
}
