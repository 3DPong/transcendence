import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { SessionConfigService } from './config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
/**
 * Import and provide app configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev',
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        SESSION_SECRET: Joi.string(),
      }),
    }),
  ],
  providers: [ConfigService, SessionConfigService],
  exports: [ConfigService, SessionConfigService],
})
export class SessionConfigModule {}
