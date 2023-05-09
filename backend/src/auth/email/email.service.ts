import { Injectable, MaxFileSizeValidator } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user/entities';
import { Repository } from 'typeorm';
import Mail = require('nodemailer/lib/mailer');
import * as nodemailer from 'nodemailer';
import { MailConfigService } from 'src/config/email/config.service';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Mail;
  private MailConfigService: MailConfigService; 

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ){
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: this.MailConfigService.email,
        pass: this.MailConfigService.password
      }
    });
  }
 
  async sendJoinEmail(email: string, signupVerifyToken: string) {
    const baseUrl = 'http://localhost:3000';

    const url = `${baseUrl}/users/email-verify?signupVerifyToken={signupVerifyToken}`;

    const mailOptions: EmailOptions = {
      to: email,
      subject: '가입 인증 메일',
      html: `인증확인 버튼을 누르면 인증이 완료됩니다.<br/><form action="${url}" method="POST">
      <button>인증하기</button></form>`
    }
    return await this.transporter.sendMail(mailOptions);
  }   
}
