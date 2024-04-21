import { DynamicModule, Global, Module } from '@nestjs/common';

import { FixtureMongoService } from './fixture.mongo.service';
import { FIXTURES_MONGO_PATH } from './fixtures-path.mongo.token';

@Global()
@Module({})
export class FixturesMongoModule {
  static forRoot(fixturesPath?: string): DynamicModule {
    return {
      module: FixturesMongoModule,
      providers: [
        {
          provide: FIXTURES_MONGO_PATH,
          useValue: fixturesPath,
        },
        FixtureMongoService,
      ],
      exports: [FixtureMongoService],
    };
  }
}
