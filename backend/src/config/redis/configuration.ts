import { registerAs } from '@nestjs/config';
export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  sessionDB: process.env.REDIS_SESSION_DB,
  socketDB: process.env.REDIS_SOCKET_DB,
}));
