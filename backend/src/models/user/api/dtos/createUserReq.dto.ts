import { IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserReqDto {
  // constraint : only english and number
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Title only allows English, number',
  })
  @MinLength(3, {
    message: 'Nickname is too short',
  })
  @MaxLength(12, {
    message: 'Nickname is too long',
  })
  nickname: string;
  @IsUrl({ require_tld: false }, { message: 'Profile url is not valid' })
  profile_url: string;
}
