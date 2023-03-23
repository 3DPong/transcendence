import { BadRequestException, Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../models/user/entities';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { SessionStatusEnum } from '../../../common/enums/sessionStatus.enum';

@Injectable()
export class OtpService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async validate(userId: number, token: string, req: Request): Promise<boolean> {
    const user: User = await this.userRepository.findOne({ where: { user_id: userId } });
    let isVerified: boolean;

    isVerified = authenticator.verify({ token: token, secret: user.two_factor_secret });
    try {
    } catch (error) {
      throw new BadRequestException('bad token input');
    }
    if (isVerified) {
      req.session.sessionStatus = SessionStatusEnum.SUCCESS;
      return true;
    } else {
      return false;
    }
  }
}
