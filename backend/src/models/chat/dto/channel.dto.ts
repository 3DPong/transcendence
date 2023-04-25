import { IsNotEmpty, IsNumber, IsString, IsUrl, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { ChannelType, ChannelUserRoles } from '../entities';

export class ChannelDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(25)
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: 'Title only allows English, Korean, number',
  })
  name: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  @MinLength(1)
  @MaxLength(25)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Title only allows English and number',
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
    message: 'Title only allows English and number',
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
