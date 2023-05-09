import { IsString, IsUrl, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class CreateEmailUserReqDto {
  // constraint : only english and number
  @IsString()
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


  /*
    @Matches 정규표현식
      ^ : 시작
      (?=.*\d) : 최소한 하나의 숫자가 있어야 함
      (?=.*[a-z]) : 최소한 하나의 소문자가 있어야 함
      (?=.*[A-Z]) : 최소한 하나의 대문자가 있어야 함
      (?=.*[~\!@#$%^&*()-_+={}[]|;:'",./<>?])` : 최소한 하나의 특수문자가 있어야 함
      (?!.*\s) : 공백이 없어야 함
      .{8,} : 최소 8자 이상
      $ : 끝
  */
  @IsString()
  @MinLength(8, {message:'비밀번호는 8자 이상 입니다.'})
  @MaxLength(25, {message:'비밀번호는 25자 이내 입니다.'})
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~`!@#$%\^&*()-_+={}[\]|;:'",./<>?])(?!.*\s).{8,}$/, {
    message: '비밀번호는 최소 하나의 소문자, 대문자, 특수문자를 포함해야 합니다.'
  })
  password: string;

  @IsUrl({ require_tld: false }, { message: 'Profile url is not valid' })
  profile_url: string;
}
