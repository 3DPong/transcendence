import { registerAs } from '@nestjs/config';

export default registerAs('kakao', () => ({
  secret: process.env.KAKAO_CLIENT_SECRET,
  id: process.env.KAKAO_CLIENT_ID,
  callback: process.env.KAKAO_CALLBACK_URL
}));
