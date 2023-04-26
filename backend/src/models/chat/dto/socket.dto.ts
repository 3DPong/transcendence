// import { IsNotEmpty, IsNumber, IsString, MaxLength, ValidateIf } from 'class-validator';
// import { MessageType } from '../entities';

// export class MessageDto {
//   @ValidateIf((object, value) => value !== null)
//   @MaxLength(500)
//   @IsString()
//   message!: string | null;

//   @IsNotEmpty()
//   @IsNumber()
//   channel_id: number;

//   @IsNotEmpty()
//   @IsString()
//   type: MessageType;
// }

// export class toggleTimeDto {
//   @IsNotEmpty()
//   @IsNumber()
//   user_id: number;

//   @IsNotEmpty()
//   @IsNumber()
//   channel_id: number;

//   end_at: Date | null;
// }

// export class toggleDto {
//   @IsNotEmpty()
//   @IsNumber()
//   user_id: number;

//   @IsNotEmpty()
//   @IsNumber()
//   channel_id: number;
// }

// export class ChannelIdDto {
//   @IsNotEmpty()
//   @IsNumber()
//   channel_id: number;
// }
