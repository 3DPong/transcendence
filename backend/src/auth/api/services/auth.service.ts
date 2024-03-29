import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../models/user/entities';
import { Repository } from 'typeorm';
import { TokenStatusEnum } from '../../../common/enums/tokenStatusEnum';
import { OtpService } from '../../otp/otp.service';
import { JwtService } from '@nestjs/jwt';
import { FtDataInterface } from '../../../common/interfaces/FtData.interface';
import { Response } from 'express';
import { UserStatusEnum } from '../../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private otpService: OtpService
  ) {}

  async redirect(ftData: FtDataInterface, res: Response): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email: ftData.email } });
    if (!user) {
      return this.signUp(ftData, res);
    } else if (user.two_factor) {
      return this.twoFactor(user.user_id, res);
    } else {
      return this.signIn(user, res);
    }
  }

  twoFactor(userId: number, res: Response): void {
    const accessToken = this.jwtService.sign({ status: TokenStatusEnum.TWO_FACTOR, user_id: userId });
    res.cookie('Authentication', accessToken, {
      httpOnly: true,
    });
    res.redirect('/2fa');
  }

  signIn(user: User, res: Response): void {
    if (user.status === UserStatusEnum.ONLINE) {
      throw new UnauthorizedException('user already connected');
    }
    const accessToken = this.jwtService.sign({ status: TokenStatusEnum.SUCCESS, user_id: user.user_id });
    res.cookie('Authentication', accessToken, {
      httpOnly: true,
    });
    res.redirect('/');
  }

  signUp(ftData: FtDataInterface, res: Response): void {
    const accessToken = this.jwtService.sign({ status: TokenStatusEnum.SIGNUP, email: ftData.email });
    res.cookie('Authentication', accessToken, {
      httpOnly: true,
    });
    res.redirect('/signup');
  }

  signOut(res: Response): void {
    // expire cookie
    res.clearCookie('Authentication');
    res.redirect('/');
  }

  async validateOtp(userId: number, token: string, res: Response): Promise<void> {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new UnauthorizedException('invalid user (session is not valid)');
    }
    const isValidated = await this.otpService.validate(user.two_factor_secret, token);
    if (isValidated) {
      return this.signIn(user, res);
    } else {
      throw new UnauthorizedException('invalid token');
    }
  }
}
