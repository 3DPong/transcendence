import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  id: process.env.MAIL_ID,
  pass: process.env.MAIL_PASS,
  callback: process.env.MAIL_CALLBACK,
}));
