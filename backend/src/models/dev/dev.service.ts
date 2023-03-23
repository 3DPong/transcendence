import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Request } from 'express';
import { User } from '../user/entities';
import { SessionService } from '../../common/session/session.service';

@Injectable()
export class DevService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private sessionService: SessionService
  ) {}

  async getSignInSession(req: Request, email: string, nickname: string, userId) {
    let user;
    let existUser;
    if (userId) {
      existUser = await this.userRepository.findOne({
        where: {
          user_id: userId,
        },
      });
    }
    if (existUser) {
      user = existUser;
    } else {
      user = new User();
      user.email = email ? email : 'test@42.fr';
      user.nickname = nickname ? nickname : 'tester42';
      user.profile_url = 'https://example.com';
    }

    try {
      const saved = await this.userRepository.save(user);
      this.sessionService.createSession(saved, req);
      return {
        status: 'SUCCESS',
        user_id: saved.user_id,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('unique constraint') && error.message.includes('violates unique constraint')) {
          throw new ConflictException('duplicate nickname');
        }
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }

  async getSignUpSession(req: Request, email: string) {
    req.session.user_id = null;
    req.session.status = null;
    req.session.email = email ? email : 'test@test.com';
    return {
      status: 'SIGNUP_MODE',
    };
  }
}
