// import { writeFileSync } from 'fs';
// import * as tmp from 'tmp';

import { Logger } from '@nestjs/common';
import { MongoClient, MongoClientOptions } from 'mongodb';

import { MongoClientProductionConfig } from './mongo-client.production.config';

export const mongoClientProductionFactory = async ({
  // tlsCa,
  url,
}: MongoClientProductionConfig) => {
  const logger = new Logger('MongoClient');

  const options: MongoClientOptions = {};

  // if (tlsCa) {
  //   const file = tmp.fileSync();
  //   writeFileSync(file.name, tlsCa);

  //   options.tls = true;
  //   options.tlsCAFile = file.name;
  //   options.tlsAllowInvalidHostnames = true;
  // }

  const client = new MongoClient(url, options);

  await client.connect();

  logger.log(`connected to mongo ${url}`);

  return client;
};
