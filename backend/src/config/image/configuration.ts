import { registerAs } from '@nestjs/config';

export default registerAs('image', () => ({
  storagePath: process.env.IMAGE_STORAGE_PATH,
}));
