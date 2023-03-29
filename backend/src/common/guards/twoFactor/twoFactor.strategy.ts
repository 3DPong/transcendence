import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { SessionStatusEnum } from '../../enums/sessionStatus.enum';

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy, 'TwoFactorStrategy') {
  constructor() {
    super();
  }

  validate(request: Request) {
    const session = request.session;
    if (!session.user_id || session.sessionStatus !== SessionStatusEnum.TWO_FACTOR)
      throw new UnauthorizedException('invalid session');
    if (session.email) session.email = null;
    return { user_id: session.user_id };
  }
}
