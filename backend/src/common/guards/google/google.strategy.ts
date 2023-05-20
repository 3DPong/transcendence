import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { GoogleConfigService } from "../../../config/google/config.service";
import axios from 'axios';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private googleService: GoogleConfigService) {
    super({
      clientID: googleService.id,
      clientSecret: googleService.secret,
      callbackURL: googleService.callback,
      scope: ["email", "profile"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // console.log(profile)
    if (!profile._json.email) return false;
    return {
      email: profile._json.email,
      profile_url: profile._json.picture
    };
  }
}