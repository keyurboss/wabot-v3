import { RedisCommandArgument } from '@redis/client/dist/lib/commands';
import { MSetArguments } from '@redis/client/dist/lib/commands/MSET';
import { RedisClient } from '../redis.token';
/* eslint-disable @typescript-eslint/no-explicit-any */
export class RedisLocalClient extends RedisClient {
  private readonly DATA: Record<string, any> = {};

  async PING(message?: RedisCommandArgument): Promise<string> {
    return message?.toString() ?? 'ok';
  }

  async SET(key: string | number, value: any) {
    this.DATA[key] = value;
  }

  async GET(key: string | number) {
    return this.DATA[key];
  }

  async HSET(
    key: string | number,
    field: string | number,
    value: any,
  ): Promise<void> {
    let d = this.DATA[key];
    if (typeof d === 'undefined') {
      d = {};
    }
    d[field] = value;
    this.DATA[key] = d;
  }

  async MSET(toSet: MSetArguments): Promise<void> {
    Object.assign(this.DATA, toSet);
  }

  async DEL(key: string | string[]): Promise<void> {
    if (!Array.isArray(key)) {
      key = [key];
    }
    for (const k of key) {
      delete this.DATA[k];
    }
  }

  async GetKeyWithMatchingPrefix(prefix: string): Promise<string[]> {
    const keys = Object.keys(this.DATA);
    return keys.filter((k) => k.startsWith(prefix));
  }
}
