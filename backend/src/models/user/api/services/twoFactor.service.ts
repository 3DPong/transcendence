import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities';
import { DataSource, Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { Request, Response } from 'express';
import { OtpService } from '../../../../common/otp/otp.service';
import { SessionService } from '../../../../common/session/session.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private userRepository: Repository<User>,
    private otpService: OtpService,
    private sessionService: SessionService
  ) {}

  /**
   * Secret key 의 경우 평문으로 저장하여 db 가 유출될 경우, 해당 유저의 2FA 인증을 공격자가 접근할 수 있다.
   * 따라서, DB에 저장이 되어야하며, 동시에 암호화된 키는 다시 복호화 할 수 있어야 한다.
   * Key rotation 을 통해서 보안을 더 강화할 수 있으나, 이는 일단은 미적용하는 것으로...
   * https://cryptojs.gitbook.io/docs/
   *
   * stream?: test 용으로 stream이 정상적으로 생성되는지 테스트하고자 함.
   */
  async activateUserTwoFactor(userId: number, req: Request, res: Response, stream: any = res): Promise<void> {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new BadRequestException('invalid user (session is not valid)');
    }
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const { encrypted, otpURI } = this.otpService.generate(user.email, 'transcendence');
      await runner.manager.update(User, { user_id: userId }, { two_factor: true, two_factor_secret: encrypted });
      this.sessionService.clearSession(req, res);
      QRCode.toFileStream(stream, otpURI);
      await runner.commitTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      throw new InternalServerErrorException('database error');
    } finally {
      await runner.release();
    }
  }

  /**
   * 2FA 를 비활성화 하기 위해서는 우선
   */
  async deactivateUserTwoFactor(userId: number, token: string, req: Request, res: Response): Promise<void> {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new BadRequestException('invalid user (session is not valid)');
    } else if (!user.two_factor) {
      throw new BadRequestException('user 2fa is not activated');
    }

    const isValidated = await this.otpService.validate(userId, token);
    if (!isValidated) {
      throw new BadRequestException('token is invalid');
    }
    await this.userRepository.update({ user_id: userId }, { two_factor: false, two_factor_secret: null });
    this.sessionService.clearSession(req, res);
  }
}
