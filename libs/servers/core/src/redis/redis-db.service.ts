import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from './redis.token';

@Injectable()
export class RedisDbService {
  readonly db: RedisClient;

  constructor(@Inject(RedisClient) client: RedisClient) {
    this.db = client;
  }
}
