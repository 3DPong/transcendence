import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-naver";
import { NaverConfigService } from "../../../config/naver/config.service";

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private naverService: NaverConfigService) {
    super({
      clientID: naverService.id,
      clientSecret: naverService.secret,
      callbackURL: naverService.callback
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    //console.log(profile)
    if (!profile._json.email) return false;
    return {
      email: profile._json.email,
      profile_url: profile._json.profile_image
    };
  }
}