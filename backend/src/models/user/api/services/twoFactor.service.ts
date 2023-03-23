import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities';
import { DataSource, Repository } from 'typeorm';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { Response } from 'express';

@Injectable()
export class TwoFactorService {
  constructor(private dataSource: DataSource, @InjectRepository(User) private userRepository: Repository<User>) {}

  async activateTwoFactor(userId: number, res: Response) {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new BadRequestException('invalid user (session is not valid)');
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const secret = authenticator.generateSecret();
      const otpURL = authenticator.keyuri(user.email, 'transcendence', secret);
      await runner.manager.update(User, { user_id: userId }, { two_factor: true, two_factor_secret: secret });
      await runner.commitTransaction();
      return QRCode.toFileStream(res, otpURL);
    } catch (error) {
      await runner.rollbackTransaction();
      throw new InternalServerErrorException('database error');
    } finally {
      await runner.release();
    }
  }

  async deactivateTwoFactor(userId: number) {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new BadRequestException('invalid user (session is not valid)');
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.manager.update(User, { user_id: userId }, { two_factor: false, two_factor_secret: null });
      await runner.commitTransaction();
      return 'deactivated';
    } catch (error) {
      await runner.rollbackTransaction();
      throw new InternalServerErrorException('database error');
    } finally {
      await runner.release();
    }
  }
}
