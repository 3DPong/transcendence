import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { PostgresConfigService } from './config.service';
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
        PG_HOST: Joi.string().default('localhost'),
        PG_PORT: Joi.number().default('5432'),
        PG_USER_NAME: Joi.string(),
        PG_PASSWORD: Joi.string(),
        PG_DATABASE: Joi.string(),
      }),
    }),
  ],
  providers: [ConfigService, PostgresConfigService],
  exports: [ConfigService, PostgresConfigService],
})
export class PostgresConfigModule {}
