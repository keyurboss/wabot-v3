import { isNotNullish } from '@rps/wabot-interfaces';
import { Inject } from '@nestjs/common';
import { RedisCommandArgument } from '@redis/client/dist/lib/commands';
import { MSetArguments } from '@redis/client/dist/lib/commands/MSET';
import { RedisClientType, SetOptions } from 'redis';
import { RedisClient } from '../redis.token';
/* eslint-disable @typescript-eslint/no-explicit-any */
export class RedisProductionClient extends RedisClient {
  constructor(@Inject(RedisClient) private readonly client: RedisClientType) {
    super();
  }

  async PING(message?: RedisCommandArgument): Promise<string> {
    return this.client.ping(message);
  }

  async SET(
    key: string,
    value: RedisCommandArgument | number,
    options?: SetOptions,
  ) {
    await this.client.set(key, value, options);
  }

  async GET(key: string) {
    const value = await this.client.get(key);
    return isNotNullish(value) ? value : undefined;
  }

  async HSET(
    key: string,
    field: string,
    value: RedisCommandArgument,
  ): Promise<void> {
    await this.client.hSet(key, field, value);
  }

  async MSET(toSet: MSetArguments): Promise<void> {
    await this.client.mSet(toSet);
  }

  async DEL(keys: string | string[]): Promise<void> {
    await this.client.del(keys);
  }

  GetKeyWithMatchingPrefix(prefix: string): Promise<string[]> {
    return this.client.KEYS(`${prefix}*`);
  }
}
