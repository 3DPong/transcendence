import { IsEmail } from "class-validator";


export class VerifyEmailToken {
  @IsEmail()
  email: string;
  
  signupVerifyToken: string;
}