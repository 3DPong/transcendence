import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';

@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy, 'SessionStrategy') {
  constructor() {
    super();
  }

  validate(request: Request) {
    const session = request.session;
    if (!session.user_id) throw new UnauthorizedException('invalid session');
    if (session.email) session.email = null;
    return { user_id: session.user_id };
  }
}
