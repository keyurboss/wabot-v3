import { Inject, Injectable, Optional } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

import { hasProp } from '@rps/wabot-interfaces';
import { RedisCommandArgument } from '@redis/client/dist/lib/commands';
import { LoggerFactory } from '../../logger';
import { RedisClient, RedisDbService } from '../../redis';
import {
  FIXTURES_REDIS_PATH,
  FixturesRedisPath,
} from './fixtures-path.redis.token';

@Injectable()
export class FixtureRedisService {
  private readonly db: RedisClient;
  private readonly logger;

  constructor(
    { db }: RedisDbService,
    loggerFactory: LoggerFactory,
    @Optional()
    @Inject(FIXTURES_REDIS_PATH)
    private readonly fixturesPath: FixturesRedisPath = resolve(
      __dirname,
      'assets',
      'fixtures',
    ),
  ) {
    this.db = db;
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async loadJson<T>(path: string) {
    // debugger;
    const fileBuffer = await readFile(resolve(this.fixturesPath, path));

    return JSON.parse(fileBuffer.toString()).data as Array<T>;
  }

  async seedFixtures<
    Fixture extends { id: RedisCommandArgument; value: RedisCommandArgument },
  >(collectionName: string, path: string, dropCollection = true) {
    const fixtures = await this.loadJson<Fixture>(path);
    if (dropCollection) {
      this.logger.verbose(`dropping ${collectionName} collection`);
      try {
        await this.db.deleteKeyWithPrefix(collectionName);
      } catch (error) {
        this.logger.verbose(`failed to drop ${collectionName} collection`);
      }
    }
    this.logger.verbose(
      `Seeding ${fixtures.length} entities from ${path} into ${collectionName}`,
    );

    const documents: Array<[RedisCommandArgument, RedisCommandArgument]> =
      fixtures.map(({ id, value }) => [id, value]);

    try {
      await this.db.mSet(documents);
    } catch (error) {
      if (
        error !== null &&
        typeof error === 'object' &&
        hasProp(error, 'code')
      ) {
        /**
         * @see https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.yml
         */
        if (error.code === 11000) {
          const ids = documents.map(([id]) => id);
          this.logger.debug(
            `Documents (${ids.join(', ')}) already exist in ${collectionName}`,
          );
          return;
        }
      }

      this.logger.error(error);
    }
  }
}
