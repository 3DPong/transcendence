import { IsEmail } from "class-validator";

export class EmailReqDto {

  @IsEmail()
  email: string;
}