import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { SessionStatusEnum } from '../../enums/sessionStatus.enum';

@Injectable()
export class UserCreationStrategy extends PassportStrategy(Strategy, 'creation') {
  constructor() {
    super();
  }

  validate(request: Request) {
    const { email, sessionStatus } = request.session;
    if (!email || sessionStatus !== SessionStatusEnum.SIGNUP) throw new UnauthorizedException('invalid session');
    return { email: email };
  }
}
