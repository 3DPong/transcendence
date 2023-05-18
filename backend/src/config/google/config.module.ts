import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_FILE } from '../envFile.constant';
import { GoogleConfigService } from './config.service';

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
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, GoogleConfigService],
  exports: [ConfigService, GoogleConfigService],
})
export class GoogleConfigModule {}
