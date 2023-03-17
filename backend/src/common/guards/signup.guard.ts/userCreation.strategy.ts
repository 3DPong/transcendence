import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Request } from 'express';

@Injectable()
export class UserCreationStrategy extends PassportStrategy(Strategy, 'creation') {
  constructor() {
    super();
  }

  validate(request: Request) {
    const session = request.session;
    if (!session.email) throw new UnauthorizedException('invalid session');
    return { email: session.email };
  }
}
