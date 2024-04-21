import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig {
  constructor(private configService: ConfigService) {}
  get authDbUrl() {
    return this.configService.get('AUTH_DB_URL');
  }

  get authDbTlsCa() {
    return this.configService.get('AUTH_DB_TLS_CA');
  }

  // get authRedisUrl() {
  //   return this.configService.get('AUTH_REDIS_URL');
  // }

  // get authRedisUsername() {
  //   return this.configService.get('AUTH_REDIS_USERNAME');
  // }

  // get authRedisPassword() {
  //   return this.configService.get('AUTH_REDIS_PASSWORD');
  // }
}
