import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { OtpConfigService } from './config.service';
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
        OTP_SECRET: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, OtpConfigService],
  exports: [ConfigService, OtpConfigService],
})
export class OtpConfigModule {}
