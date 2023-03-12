import { registerAs } from '@nestjs/config';
export default registerAs('postgres', () => ({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  username: process.env.PG_USER_NAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
}));
