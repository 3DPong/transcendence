import { IsNotEmpty, IsString, Matches, MaxLength, MinLength, ValidateIf } from "class-validator";
import { ChannelType } from "../../entities/chatChannel.entity";

export class ChannelDto {

	@IsNotEmpty()
	@IsString()
	@MinLength(1)
	@MaxLength(25)
	@Matches(/^[가-힣a-zA-Z\s]+$/, {
		message: 'Title only accepts Englich and number'
	})
	name: string;

	@IsString()
	@ValidateIf((object, value) => value !== null)
	@MinLength(1)
	@MaxLength(25)
	@Matches(/^[a-zA-Z0-9]+$/, {
		message: 'Title only accepts Englich and number'
	})
	password!: string | null;

	type: ChannelType;
}