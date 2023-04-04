import { isDate, IsDate, isDateString, IsNotEmpty, IsNumber, IsNumberString, IsString, IsUrl, Matches, MaxLength, MinLength, ValidateIf } from "class-validator";
import { ChannelUserRoles } from "../entities";
import { ChannelType } from "../entities/chatChannel.entity";

export class ChannelDto {

	@IsNotEmpty()
	@IsString()
	@MinLength(1)
	@MaxLength(25)
	@Matches(/^[가-힣a-zA-Z\s]+$/, {
		message: 'Title only allows English, Korean, number'
	})
	name: string;

	@IsString()
	@ValidateIf((object, value) => value !== null)
	@MinLength(1)
	@MaxLength(25)
	@Matches(/^[a-zA-Z0-9]+$/, {
		message: 'Title only allows English and number'
	})
	password!: string | null;

	@IsNotEmpty()
	type: ChannelType;

	@IsNumber()
	inviteList: number[] | null;

	@IsUrl()
	thumbnail_url: string | null;


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
		message: 'Title only allows English and number'
	})
	password!: string | null;
}

export class LogDto {

	@IsNotEmpty()
	@IsString()
	@MaxLength(80)
	content: string;
}

export class UserIdDto {

	@IsNotEmpty()
	@IsNumber()
	@MinLength(1)
	user_id: number;

	@IsNotEmpty()
	@IsString()
	role: ChannelUserRoles;
}

export class User {
	@IsNotEmpty()
	@IsNumber()
  user_id: number;

	@IsNotEmpty()
	@IsString()
  nickname: string;

	@IsNotEmpty()
	@IsNumber()
  socket_id: string;
}

export class MessageDto {

	@IsNotEmpty()
	@IsString()
  message: string;

	@IsNotEmpty()
	@IsNumber()
  channel_id: number;

}

export class toggleTimeDto {
	@IsNotEmpty()
	@IsNumber()
  user_id: number;

	@IsNotEmpty()
	@IsNumber()
  channel_id: number;
  
  end_at: Date | null;
}

export class toggleDto {
	@IsNotEmpty()
	@IsNumber()
  user_id: number;

	@IsNotEmpty()
	@IsNumber()
  channel_id: number;

}

export  class ChannelIdDto {
	@IsNotEmpty()
	@IsNumber()
  channel_id: number;
}
