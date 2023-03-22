import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from '../user/entities';
import { SessionService } from '../../common/session/session.service';

@Injectable()
export class DevService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private sessionService: SessionService
  ) {}

  async getSignInSession(req: Request, email: string, nickname: string) {
    const user: User = new User();
    user.email = email ? email : 'test@42.fr';
    user.nickname = nickname ? nickname : 'tester42';
    user.profile_url = 'https://example.com';

    const saved = await this.userRepository.save(user);
    this.sessionService.createSession(saved, req);
    return {
      status: 'SUCCESS',
      user_id: saved.user_id,
    };
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
