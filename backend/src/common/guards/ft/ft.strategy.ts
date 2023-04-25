import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FtConfigService } from '../../../config/ft/config.service';
import { Strategy } from 'passport-oauth2';
import axios from 'axios';
import { FtDataInterface } from '../../interfaces/FtData.interface';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft') {
  constructor(private ftConfigService: FtConfigService) {
    super({
      authorizationURL: `https://api.intra.42.fr/oauth/authorize?client_id=?${ftConfigService.client}&redirect_uri=${ftConfigService.callback}&response_type=code`,
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: ftConfigService.client,
      clientSecret: ftConfigService.secret,
      callbackURL: ftConfigService.callback,
    });
  }

  async validate(accessToken: string, refreshToken: string): Promise<FtDataInterface | boolean> {
    // get profile information from 42 api
    const { data } = await axios.get('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const email = data.email;
    const profileUrl = data.image.link;
    if (!email) return false;
    return {
      email: email,
      profile_url: profileUrl,
    };
  }
}
