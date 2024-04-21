import { Global, Module, Provider } from '@nestjs/common';

// import {  } from '@rps/bullion-interfaces/core';
import {
  ACCESS_TOKEN_SERVICE,
  REFRESH_TOKEN_SERVICE
} from '@rps/wabot-interfaces';
import { JwtService } from '@rps/wabot-server-core';
import { AppConfig } from './app.config';

const services: Provider[] = [
  {
    provide: ACCESS_TOKEN_SERVICE,
    useFactory: (config: AppConfig) => {
      return new JwtService(config.accessTokenKey);
    },
    inject: [AppConfig],
  },
  {
    provide: REFRESH_TOKEN_SERVICE,
    useFactory: (config: AppConfig) => {
      return new JwtService(config.refreshTokenKey);
    },
    inject: [AppConfig],
  },
];

@Global()
@Module({
  providers: [...services],
  exports: [...services],
})
export class TokenModule {}
