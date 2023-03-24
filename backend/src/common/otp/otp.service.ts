import { BadRequestException, Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../models/user/entities';
import { Repository } from 'typeorm';
import { OtpConfigService } from '../../config/otp/config.service';
import * as CryptoJS from 'crypto-js';
@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private otpConfigService: OtpConfigService
  ) {}

  /**
   * NOTE!!
   * encryption 의 key 는 utf-8 형태로 stringify 된다.
   */
  async validate(userId: number, token: string): Promise<boolean> {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    const decrypted: string = CryptoJS.AES.decrypt(user.two_factor_secret, this.otpConfigService.secret).toString(
      CryptoJS.enc.Utf8
    );
    try {
      return authenticator.verify({ token: token, secret: decrypted });
    } catch (error) {
      throw new BadRequestException('bad token input');
    }
  }

  generate(accountName: string, issuer: string) {
    const secret = authenticator.generateSecret();
    const encrypted = CryptoJS.AES.encrypt(secret, this.otpConfigService.secret).toString();
    const otpURI = authenticator.keyuri(accountName, issuer, secret);

    return {
      encrypted: encrypted,
      otpURI: otpURI,
    };
  }
}
