import { registerAs } from '@nestjs/config';

export default registerAs('naver', () => ({
  secret: process.env.NAVER_CLIENT_SECRET,
  id: process.env.NAVER_CLIENT_ID,
  callback: process.env.NAVER_CALLBACK_URL
}));
