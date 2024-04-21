import { Logger, Provider } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AsyncReturnType } from 'type-fest';

export const mongoMemoryServerFactory = async () => {
  const logger = new Logger('MongoMemoryServer');
  const server = await MongoMemoryServer.create();
  logger.log(`Server created: ${server.getUri()}`);
  return server;
};

export type MongoMemoryServerFactoryReturnType = AsyncReturnType<
  typeof mongoMemoryServerFactory
>;

export const mongoMemoryServerProvider: Provider = {
  provide: MongoMemoryServer,
  useFactory: mongoMemoryServerFactory,
};
