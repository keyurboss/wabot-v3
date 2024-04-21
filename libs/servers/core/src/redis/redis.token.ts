// export const REDIS_CLIENT = 'REDIS_CLIENT';
import { RedisCommandArgument } from '@redis/client/dist/lib/commands';
import { MSetArguments } from '@redis/client/dist/lib/commands/MSET.d';
import { SetOptions } from '@redis/client/dist/lib/commands/SET.d';
/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class RedisClient {
  ping(message?: RedisCommandArgument): Promise<string> {
    return this.PING(message);
  }
  protected abstract PING(message?: RedisCommandArgument): Promise<string>;
  protected abstract SET(
    key: string | number,
    value: any,
    options?: SetOptions,
  ): Promise<void>;

  async set(key: string | number, value: any, options?: SetOptions) {
    this.SET(key, value, options);
  }

  protected abstract GET(key: string): Promise<string | undefined>;

  async get(key: string): Promise<string | undefined> {
    return this.GET(key);
  }

  protected abstract HSET(
    key: string,
    field: string,
    value: RedisCommandArgument,
  ): Promise<void>;

  async hSet(key: string, field: string, value: RedisCommandArgument) {
    return this.HSET(key, field, value);
  }

  protected abstract MSET(toSet: MSetArguments): Promise<void>;

  async mSet(toSet: MSetArguments) {
    return this.MSET(toSet);
  }

  protected abstract DEL(key: string | string[]): Promise<void>;

  async del(key: string | string[]): Promise<void> {
    return this.DEL(key);
  }

  protected abstract GetKeyWithMatchingPrefix(
    prefix: string,
  ): Promise<string[]>;

  async deleteKeyWithPrefix(prefix: string) {
    await this.DEL(await this.GetKeyWithMatchingPrefix(prefix));
  }
}
