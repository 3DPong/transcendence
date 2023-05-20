import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";
import { KakaoConfigService } from "../../../config/kakao/config.service";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private kakaoService: KakaoConfigService) {
    super({
      clientID: kakaoService.id,
      clientSecret: kakaoService.secret,
      callbackURL: kakaoService.callback,
      scope: ["account_email", "profile_nickname"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    //console.log(profile)
    if (!profile._json.kakao_account.email) return false;
    return {
      email: profile._json.kakao_account.email,
      profile_url: profile._json.kakao_account.profile,
    };
  }
}