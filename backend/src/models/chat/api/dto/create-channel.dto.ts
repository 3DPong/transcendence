import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ChannelType } from "../../entities/chatChannel.entity";

export class CreateChannelDto {

	@IsNotEmpty()
	@IsString()
	@MinLength(1)
	@MaxLength(25)
	name: string;

	@IsString()
	@MinLength(1)
	@MaxLength(25)
	@Matches(/^[a-zA-Z0-9]*$/, {
		message: 'Title only accepts Englich and number'
	})
	password: string;

	type: ChannelType;
}
