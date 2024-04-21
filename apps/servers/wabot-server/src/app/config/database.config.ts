import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig {
  constructor(private configService: ConfigService) {}
  get authDbUrl() {
    return this.configService.get('DB_URL');
  }

  get authDbTlsCa() {
    return this.configService.get('DB_TLS_CA');
  }
}
