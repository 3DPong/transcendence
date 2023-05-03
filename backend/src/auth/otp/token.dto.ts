import { IsString, Length } from 'class-validator';

export class TokenDto {
  @IsString()
  @Length(6, 6)
  token: string;
}
