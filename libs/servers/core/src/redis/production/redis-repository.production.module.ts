import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { RedisDbHealthIndicator } from '../redis-db.health';
import { RedisDbService } from '../redis-db.service';
import { RedisClient } from '../redis.token';
import {
  RedisClientProductionConfig,
  RedisClientProductionConfigOptions,
} from './redis-client.production.config';
import { redisClientProductionFactory } from './redis-client.production.factory';
import { RedisClientType } from 'redis';

export type RedisRepositoryProductionModuleConfig =
  RedisClientProductionConfigOptions;

@Global()
@Module({
  providers: [
    RedisDbService,
    {
      provide: RedisClient,
      useFactory: redisClientProductionFactory,
      inject: [RedisClientProductionConfig],
    },
    RedisDbHealthIndicator,
  ],
  exports: [RedisDbService, RedisDbHealthIndicator],
})
export class RedisRepositoryProductionModule implements OnModuleDestroy {
  constructor(@Inject(RedisClient) private readonly client: RedisClientType) {}

  static forRoot({
    urlKey,
    passwordKey,
  }: RedisRepositoryProductionModuleConfig): DynamicModule {
    const providers: ModuleMetadata['providers'] = [
      {
        provide: RedisClientProductionConfig,
        useFactory: () =>
          new RedisClientProductionConfig({ urlKey, passwordKey }),
      },
    ];

    return {
      module: RedisRepositoryProductionModule,
      providers,
    };
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
