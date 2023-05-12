import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user/entities';
import { Repository } from 'typeorm';
import Mail = require('nodemailer/lib/mailer');
import * as nodemailer from 'nodemailer';
import { MailConfigService } from 'src/config/email/config.service';
import * as bcrypt from 'bcryptjs';


interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Mail;
  

  constructor(
    private MailConfigService: MailConfigService
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS
      }
    });
  }
 
  async sendJoinEmail(email: string) {
    //const baseUrl = 'http://localhost:3000';
    //const url = `${baseUrl}/users/email-verify?signupVerifyToken=${signupVerifyToken}`;
    let verifyCode = await Math.random().toString().substr(2,6);
    const mailOptions: EmailOptions = {
      to: email,
      subject: '가입 인증 메일',
      html:`<div
      style='
      text-align: center; 
      width: 50%; 
      height: 60%;
      margin: 15%;
      padding: 20px;
      box-shadow: 1px 1px 3px 0px #999;
      '>
      <h2> 3D Pong</h2> <br/> <h2> 아래의 인증 코드를 입력해주세요</h2> <br/> ${verifyCode} <br/><br/><br/><br/></div>`,  
    }

    await this.transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        throw new Error(`Send Verify Mail Fail : ${error}`);
      }
      this.transporter.close();
    });

    const salt = await bcrypt.genSalt();
    const hashedEmailCode = await bcrypt.hash(verifyCode, salt);
    return hashedEmailCode;
  }   


}


