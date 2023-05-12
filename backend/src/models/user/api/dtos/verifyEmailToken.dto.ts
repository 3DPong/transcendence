import { IsEmail, IsString } from "class-validator";


export class VerifyEmailToken {
  @IsEmail()
  email: string;

  @IsString()
  clientCode: string
  
  @IsString()
  verifyCode: string;
}