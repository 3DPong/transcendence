import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../models/user/entities';
import { Repository } from 'typeorm';
import { UserStatusEnum } from '../../../common/enums';
import { Request } from 'express';
import { SessionData } from 'express-session';
@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  private async getUserSession(
    userId: number,
    req: Request
  ): Promise<{ sid: string; userSession: SessionData } | null> {
    const sessions = await new Promise((resolve, reject) => {
      req.sessionStore.all((err, sessions) => {
        if (err) {
          reject(err);
        } else {
          resolve(sessions);
        }
      });
    });

    for (const sessionId of Object.keys(sessions)) {
      const session = sessions[sessionId] as SessionData;
      if (session.user_id === userId) {
        return { sid: sessionId, userSession: session };
      }
    }
    return null;
  }

  private async destroySession(sid: string, req: Request): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      req.sessionStore.destroy(sid, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async checkSession(user: User, req: Request) {
    // 이미 존재하는 세션 처리
    const session = await this.getUserSession(user.user_id, req);
    if (!session) return;
    const { sid, userSession } = session;
    if (sid && userSession) {
      if (userSession.status === UserStatusEnum.ONLINE) {
        throw new ConflictException('이미 다른 세션이 존재합니다.');
      } else {
        await this.destroySession(sid, req); // offline 일 경우에는 이전 세션 삭제하도록 함.
      }
    }
  }

  private createSession(user: User, req: Request) {
    req.session.user_id = user.user_id;
    req.session.status = UserStatusEnum.ONLINE; // fixme : alarm socket 연결 시에?
    req.session.email = null;
  }

  async redirect(data, req: Request) {
    const user = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
    });
    console.log(user, data.email);
    if (!user) {
      return await this.signUp(data, req);
    } else {
      return await this.signIn(user, req);
    }
  }

  async signIn(user: User, req: Request) {
    // 2FA 상황인지 체크
    if (user.two_factor) {
      return await this.twoFactorAuthentication(user, req);
    }
    await this.checkSession(user, req);
    this.createSession(user, req);
    return {
      status: 'SIGN_IN_SUCCESS',
      user: {
        user_id: user.user_id,
        profile_url: user.profile_url,
      },
    };
  }

  /**
   * api 가 접근이 될 때, 유저를 바로 생성하지 않고 생성 권한을 부여하는 역할을 수행함.
   */
  async signUp(data, req: Request) {
    req.session.user_id = null;
    req.session.status = null; // fixme : alarm socket 연결 시에?
    req.session.email = data.email;
    // req.session.cookie.expires = new Date(600000); // 10 mins for creation
    return {
      status: 'SIGN_UP_MODE',
      user: {
        profile_url: data.email,
      },
    };
  }

  async twoFactorAuthentication(user: User, req: Request) {}
}
