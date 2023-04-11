import { IsNotEmpty, IsNumber, IsString, Matches, MaxLength } from "class-validator";

export class MessageDto {
  @IsNotEmpty({ message: '내용을 입력해주세요' })
  @MaxLength(500)
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

export class ChannelIdDto {
  @IsNotEmpty()
  @IsNumber()
  channel_id: number;
}
