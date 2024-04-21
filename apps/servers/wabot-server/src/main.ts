/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule, HttpExceptionFilter } from './app/app.module';
import { AppEnvName, appEnvNameKey } from '@rps/wabot-interfaces';
import { AppConfig } from './app/config/app.config';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const globalPrefix = 'api';
//   app.setGlobalPrefix(globalPrefix);
//   const port = process.env.PORT || 3000;
//   await app.listen(port);
//   Logger.log(
//     `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
//   );
// }

async function bootstrap() {
  const log = new Logger('Auth Service');
  const app = await NestFactory.create(
    AppModule.register({
      appEnv: process.env[appEnvNameKey] as AppEnvName,
    }),
    {
      cors: true,
    },
  );

  const config = app.get(AppConfig);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app
    // .useGlobalPipes(
    //   new ValidationPipe({ transform: true, forbidUnknownValues: false })
    // )
    // .enableShutdownHooks()
    .listen(config.port);

  log.log(`🚀 Service is running on: ${await app.getUrl()}`);
}

bootstrap();
