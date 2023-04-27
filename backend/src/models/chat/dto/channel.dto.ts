import { IsNotEmpty, IsNumber, IsString, IsUrl, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { ChannelType, ChannelUserRoles } from '../entities';

export class ChannelDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1, {message:'제목은 한 글자 이상 입니다.'})
  @MaxLength(25, {message:'제목은 25자 이내 입니다.'})
  @Matches(/^[ㄱ-ㅎ가-힣a-zA-Z0-9\s]+$/, {
    message: '제목은 영어, 한글, 숫자 만 가능합니다.',
  })
  name: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  @MinLength(1, {message:'비밀번호는 한 글자 이상 입니다.'})
  @MaxLength(25, {message:'비밀번호는 25자 이내 입니다.'})
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: "비밀번호는 영어와 숫자만 가능합니다."
  })
  password!: string | null;

  @IsNotEmpty()
  type: ChannelType;

  @ValidateIf((object, value) => value !== null)
  inviteList!: number[] | null;

  @ValidateIf((object, value) => value !== null)
  @IsUrl({ require_tld: false })
  thumbnail_url!: string | null;
}

export class JoinDto {
  @IsNotEmpty()
  @IsNumber()
  channel_id: number;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  @MinLength(1)
  @MaxLength(25)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: "비밀번호는 영어와 숫자만 가능합니다."
  })
  password!: string | null;
}

export class UserIdDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  role: ChannelUserRoles;
}
