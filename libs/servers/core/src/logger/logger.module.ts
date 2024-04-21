import { Global, Module } from '@nestjs/common';

import { LoggerFactory } from './logger.factory';

@Global()
@Module({
  providers: [
    {
      provide: LoggerFactory,
      useFactory: () => new LoggerFactory(),
    },
  ],
  exports: [LoggerFactory],
})
export class LoggerModule {}
