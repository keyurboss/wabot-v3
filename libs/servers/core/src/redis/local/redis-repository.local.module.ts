import { Global, Module } from '@nestjs/common';

import { RedisDbHealthIndicator } from '../redis-db.health';
import { RedisDbService } from '../redis-db.service';
import { RedisClient } from '../redis.token';
import { RedisLocalClient } from './redis-client.local';

@Global()
@Module({
  providers: [
    RedisDbService,
    {
      provide: RedisClient,
      useValue: new RedisLocalClient(),
    },
    RedisDbHealthIndicator,
  ],
  exports: [RedisDbService, RedisDbHealthIndicator],
})
export class RedisRepositoryLocalModule {}
