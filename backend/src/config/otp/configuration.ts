import { registerAs } from '@nestjs/config';

export default registerAs('otp', () => ({
  secret: process.env.OTP_SECRET,
}));
