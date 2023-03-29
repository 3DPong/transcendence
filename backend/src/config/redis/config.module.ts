import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { RedisConfigService } from './config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_FILE } from '../envFile.constant';
/**
 * Import and provide app configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV_FILE[process.env.NODE_ENV],
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default('6379'),
      }),
    }),
  ],
  providers: [ConfigService, RedisConfigService],
  exports: [ConfigService, RedisConfigService],
})
export class RedisConfigModule {}
