import { IsNotEmpty, IsNumber } from 'class-validator';

export class DmDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;
}
