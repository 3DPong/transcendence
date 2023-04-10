import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

export class ChannelIdDto {
  @IsNotEmpty()
  @IsNumber()
  channel_id: number;
}
