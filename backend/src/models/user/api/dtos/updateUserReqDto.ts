import { IsOptional, IsUrl } from 'class-validator';

export class UpdateUserReqDto {
  @IsOptional()
  nickname?: string;
  @IsOptional()
  @IsUrl()
  profile_url?: string;
}
