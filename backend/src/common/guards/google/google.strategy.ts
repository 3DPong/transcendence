import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { GoogleConfigService } from "../../../config/google/config.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private googleService: GoogleConfigService) {
    super({
      clientID: googleService.id,
      clientSecret: googleService.secret,
      callbackURL: googleService.callback,
      scope: ["account_email", "profile_nickname"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('\n\naccessToken = '+accessToken)
    console.log('refreshToken = '+refreshToken)
    console.log(profile)
    console.log(profile._json.google_account.email)

    return {
      name: profile.displayName,
      email: profile._json.google_account.email,

      // email: profile._json.google_account.email,
      // profile_url: profile._json.google_account.profile,
    };
  }
}