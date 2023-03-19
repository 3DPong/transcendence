import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { FtConfigService } from './config.service';
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
        FT_CLIENT: Joi.string(),
        FT_SECRET: Joi.string(),
        FT_CALLBACK: Joi.string(),
      }),
    }),
  ],
  providers: [ConfigService, FtConfigService],
  exports: [ConfigService, FtConfigService],
})
export class FtConfigModule {}
