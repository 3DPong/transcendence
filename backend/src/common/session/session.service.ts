import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { SessionData } from 'express-session';
import { User } from '../../models/user/entities';
import { UserStatusEnum } from '../enums';
import { SessionStatusEnum } from '../enums/sessionStatus.enum';

@Injectable()
export class SessionService {
  private logger = new Logger();

  async getUserSession(userId: number, req: Request): Promise<{ sid: string; userSession: SessionData } | null> {
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
        return { sid: (session as any).id, userSession: session };
      }
    }
    return null;
  }

  async destroySessionBySid(sid: string, req: Request): Promise<void> {
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

  async destroySessionByUserId(userId: number, req: Request): Promise<void> {
    const session = await this.getUserSession(userId, req);
    if (!session) return;
    const { sid, userSession } = session;
    if (userSession) {
      await this.destroySessionBySid(sid, req);
    }
  }

  async checkSession(user: User, req: Request) {
    // 이미 존재하는 세션 처리
    const session = await this.getUserSession(user.user_id, req);
    if (!session) return;
    const { sid, userSession } = session;
    if (userSession) {
      if (userSession.userStatus === UserStatusEnum.ONLINE) {
        this.logger.log(`conflict on session : ${session.userSession}`);
        throw new ConflictException('이미 다른 세션이 존재합니다.');
      } else {
        await this.destroySessionBySid(sid, req); // offline 일 경우에는 이전 세션 삭제하도록 함.
      }
    }
  }

  createSession(user: User, req: Request) {
    req.session.user_id = user.user_id;
    req.session.userStatus = UserStatusEnum.ONLINE; // fixme : alarm socket 연결 시에?
    req.session.sessionStatus = SessionStatusEnum.SUCCESS;
    req.session.email = null;
  }
}
