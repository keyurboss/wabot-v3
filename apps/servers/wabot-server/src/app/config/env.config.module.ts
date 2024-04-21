import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';

import { AppConfig } from './app.config';
import { DatabaseConfig } from './database.config';
import { defaultValidationSchema } from './validation.schema';
import Joi from 'joi';

@Global()
@Module({
  providers: [AppConfig, DatabaseConfig],
  exports: [AppConfig, DatabaseConfig],
})
export class EnvConfigModule {
  static forRoot({
    configModuleOption = {},
    validationSchema,
  }: {
    validationSchema?: unknown;
    configModuleOption?: Partial<ConfigModuleOptions>;
  } = {}): DynamicModule {
    return {
      module: EnvConfigModule,
      imports: [
        ConfigModule.forRoot({
          validationSchema: Joi.object(
            validationSchema ?? defaultValidationSchema,
          ),
          isGlobal: true,
          cache: true,
          ...configModuleOption,
        }),
      ],
    };
  }
}
