import { Logger } from '@nestjs/common';
import { createClient } from 'redis';

import { RedisClientOptions } from '@redis/client';
import { RedisClientProductionConfig } from './redis-client.production.config';

export const redisClientProductionFactory = async ({
  password,
  userName,
  url,
}: RedisClientProductionConfig) => {
  const logger = new Logger('RedisClient');

  const options: RedisClientOptions = {
    url,
  };
  if (password) {
    options.password = password;
  }
  if (userName) {
    options.username = userName;
  }
  const client = createClient(options);

  await client.connect();

  logger.log(`connected to redis ${url}`);

  return client;
};
