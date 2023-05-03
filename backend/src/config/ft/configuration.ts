import { registerAs } from '@nestjs/config';

export default registerAs('ft', () => ({
  client: process.env.FT_CLIENT,
  secret: process.env.FT_SECRET,
  callback: process.env.FT_CALLBACK,
}));
