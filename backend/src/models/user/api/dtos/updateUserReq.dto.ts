import { IsOptional, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserReqDto {
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Title only allows English, number',
  })
  @MinLength(3, {
    message: 'Nickname is too short',
  })
  @MaxLength(12, {
    message: 'Nickname is too long',
  })
  nickname?: string;
  @IsOptional()
  @IsUrl()
  profile_url?: string;
}
