import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { AsyncReturnType } from 'type-fest';

import { MongoDbHealthIndicator } from '../mongo-db.health';
import { MongoDbService } from '../mongo-db.service';
import { mongoClientLocalFactory } from './mongo-client.local.factory';
import {
  mongoMemoryServerFactory,
  mongoMemoryServerProvider,
} from './mongo-memory-server.factory';

@Global()
@Module({
  providers: [
    MongoDbService,
    {
      provide: MongoClient,
      useFactory: mongoClientLocalFactory,
      inject: [MongoMemoryServer],
    },
    mongoMemoryServerProvider,
    MongoDbHealthIndicator,
  ],
  exports: [MongoDbService, MongoDbHealthIndicator, MongoMemoryServer],
})
export class MongoRepositoryLocalModule implements OnModuleDestroy {
  constructor(
    @Inject(MongoMemoryServer)
    private readonly mongoMemoryServer: AsyncReturnType<
      typeof mongoMemoryServerFactory
    >,
    private readonly client: MongoClient,
  ) {}

  async onModuleDestroy() {
    await this.client.close();
    await this.mongoMemoryServer?.stop();
  }
}
