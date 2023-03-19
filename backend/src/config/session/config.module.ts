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
      envFilePath: ['.env.dev'],
      load: [configuration],
      validationSchema: Joi.object({
        SESSION_SECRET: Joi.string(),
      }),
    }),
  ],
  providers: [ConfigService, SessionConfigService],
  exports: [ConfigService, SessionConfigService],
})
export class SessionConfigModule {}
