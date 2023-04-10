import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities';
import { DataSource, Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { Response } from 'express';
import { OtpService } from '../../../../auth/otp/otp.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private userRepository: Repository<User>,
    private otpService: OtpService
  ) {}

  /**
   * Secret key 의 경우 평문으로 저장하여 db 가 유출될 경우, 해당 유저의 2FA 인증을 공격자가 접근할 수 있다.
   * 따라서, DB에 저장이 되어야하며, 동시에 암호화된 키는 다시 복호화 할 수 있어야 한다.
   * Key rotation 을 통해서 보안을 더 강화할 수 있으나, 이는 일단은 미적용하는 것으로...
   * https://cryptojs.gitbook.io/docs/
   *
   * stream?: test 용으로 stream이 정상적으로 생성되는지 테스트하고자 함.
   */
  async getQRCode(userId: number, res: Response, stream: any = res): Promise<void> {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new UnauthorizedException('invalid user (session is not valid)');
    } else if (user.two_factor) {
      throw new BadRequestException('already activated');
    }
    // generate otp secret & send QR code
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const { encrypted, otpURI } = this.otpService.generate(user.email, 'transcendence');
      await runner.manager.update(User, { user_id: userId }, { two_factor: false, two_factor_secret: encrypted });
      await QRCode.toFileStream(stream, otpURI);
      await runner.commitTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      throw new InternalServerErrorException('server error');
    } finally {
      await runner.release();
    }
  }

  async activateUserTwoFactor(userId: number, token: string): Promise<void> {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new UnauthorizedException('invalid user (session is not valid)');
    } else if (user.two_factor) {
      throw new BadRequestException('already activated');
    } else if (!user.two_factor_secret) {
      throw new BadRequestException('user 2fa is not initiated');
    }
    // validate token
    const otpSecret: string = user.two_factor_secret;
    const isValidated = await this.otpService.validate(otpSecret, token);
    if (!isValidated) {
      throw new BadRequestException('token is invalid');
    }
    // activate 2fa
    try {
      await this.userRepository.update({ user_id: userId }, { two_factor: true, two_factor_secret: otpSecret });
    } catch (error) {
      throw new InternalServerErrorException('server error');
    }
  }

  async deactivateUserTwoFactor(userId: number, token: string): Promise<void> {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new UnauthorizedException('invalid user (session is not valid)');
    } else if (!user.two_factor) {
      throw new BadRequestException('user 2fa is not activated');
    }
    // validate token
    const isValidated = await this.otpService.validate(user.two_factor_secret, token);
    if (!isValidated) {
      throw new BadRequestException('token is invalid');
    }
    // deactivate 2fa
    await this.userRepository.update({ user_id: userId }, { two_factor: false, two_factor_secret: null });
  }
}
