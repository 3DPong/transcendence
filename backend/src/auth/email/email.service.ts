import { Injectable } from '@nestjs/common';
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
  

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private MailConfigService: MailConfigService
  ){
    console.log(this.MailConfigService.email);
    console.log(this.MailConfigService.password);
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        //1.
        // user: "rbfla6334@gmail.com",
        // pass: "tukjskjsqvkdankq"
        
        //2.
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS
      }
    });
  }
 
  async sendJoinEmail(email: string, signupVerifyToken: string) {
    const baseUrl = 'http://localhost:3000';

    const url = `${baseUrl}/users/email-verify?signupVerifyToken=${signupVerifyToken}`;

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
      <h2> 안녕하세요.</h2> <br/> <h2>제목: 메일 인증 확인</h2> <br/><form action="${url}" method="POST">
      <button>인증하기</button></form> <br/><br/><br/><br/></div>`, 
      

    }

    return await this.transporter.sendMail(mailOptions);
  }   


  // async sendJoinEmail2(email: string, signupVerifyToken: string) {
  //   const nodemailer = require('nodemailer');
    
  //   module.exports = async (req, res, next) => {
  //     const { email, title, desc, username } = req.body; // 보낼 이메일 주소, 이메일 제목, 이메일 본문, 받는 사람 이름
  //     try {
  //     // 전송하기
  //       let transporter = nodemailer.createTransport({
  //         service: 'gmail',
  //         host: 'smtp.gmail.com', // gmail server 사용
  //         port: 587,
  //         secure: false,
  //         auth: {
  //           user: this.MailConfigService.email,
  //           pass: this.MailConfigService.password
  //         },
  //       });
        
  //       // 보낼 메세지
  //       let message = {
  //         from: process.env.GOOGLE_MAIL, // 보내는 사람
  //         to: `${username}<${email}>`, // 받는 사람 이름과 이메일 주소
  //         subject: title, // 메일 제목
  //         html: `<div // 메일 본문 -> html을 이용해 꾸며서 보낼수 있다
  //         style='
  //         text-align: center; 
  //         width: 50%; 
  //         height: 60%;
  //         margin: 15%;
  //         padding: 20px;
  //         box-shadow: 1px 1px 3px 0px #999;
  //         '>
  //         <h2>${username} 님, 안녕하세요.</h2> <br/> <h2>제목: ${title}</h2> <br/>${desc} <br/><br/><br/><br/></div>`,
  //       };
        
  //       // 메일이 보내진 후의 콜백 함수
  //       transporter.sendMail(message, (err) => {
  //         if (err) next(err);
  //         else res.status(200).json({ isMailSucssessed: true});
  //       });
  //     } catch (err) {
  //       next(err);
  //     }
  //   };
  // }

}


