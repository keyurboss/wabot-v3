import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  OnModuleDestroy,
} from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { MongoDbHealthIndicator } from '../mongo-db.health';
import { MongoDbService } from '../mongo-db.service';
import {
  MongoClientProductionConfig,
  MongoClientProductionConfigOptions,
} from './mongo-client.production.config';
import { mongoClientProductionFactory } from './mongo-client.production.factory';

export type MongoRepositoryProductionModuleConfig =
  MongoClientProductionConfigOptions;

@Global()
@Module({
  providers: [
    MongoDbService,
    {
      provide: MongoClient,
      useFactory: mongoClientProductionFactory,
      inject: [MongoClientProductionConfig],
    },
    MongoDbHealthIndicator,
  ],
  exports: [MongoDbService, MongoDbHealthIndicator],
})
export class MongoRepositoryProductionModule implements OnModuleDestroy {
  constructor(private readonly client: MongoClient) {}

  static forRoot({
    urlKey,
    tlsCaKey,
  }: MongoRepositoryProductionModuleConfig): DynamicModule {
    const providers: ModuleMetadata['providers'] = [
      {
        provide: MongoClientProductionConfig,
        useFactory: () => new MongoClientProductionConfig({ urlKey, tlsCaKey }),
      },
    ];

    return {
      module: MongoRepositoryProductionModule,
      providers,
    };
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
