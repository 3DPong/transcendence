import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { TokenStatusEnum } from '../../enums/tokenStatusEnum';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfigService } from '../../../config/jwt/config.service';
import { JwtPayloadInterface } from '../../interfaces/JwtUser.interface';
import { Request } from 'express';

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy, 'JwtTwoFactorStrategy') {
  constructor(private jwtConfigService: JwtConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string => {
          return req?.cookies?.Authentication;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfigService.secret,
    });
  }

  validate(payload: JwtPayloadInterface) {
    if (payload) {
      if (payload.status === TokenStatusEnum.TWO_FACTOR) {
        return payload;
      } else {
        throw new UnauthorizedException('invalid user (token status is invalid)');
      }
    }
  }
}
