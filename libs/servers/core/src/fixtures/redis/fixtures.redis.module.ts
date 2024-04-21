import { DynamicModule, Global, Module } from '@nestjs/common';

import { FixtureRedisService } from './fixture.redis.service';
import { FIXTURES_REDIS_PATH } from './fixtures-path.redis.token';

@Global()
@Module({})
export class FixturesRedisModule {
  static forRoot(fixturesRedisPath?: string): DynamicModule {
    return {
      module: FixturesRedisModule,
      providers: [
        {
          provide: FIXTURES_REDIS_PATH,
          useValue: fixturesRedisPath,
        },
        FixtureRedisService,
      ],
      exports: [FixtureRedisService],
    };
  }
}
