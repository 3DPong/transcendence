import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';

@Injectable()
export class UserCreationStrategy extends PassportStrategy(Strategy, 'creation') {
  constructor() {
    super();
  }

  validate(request: Request) {
    const email = request.session.email;
    if (!email) throw new UnauthorizedException('invalid session');
    return { email: email };
  }
}
