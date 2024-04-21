import { Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const mongoClientLocalFactory = async (
  mongoMemoryServer: MongoMemoryServer,
) => {
  const logger = new Logger('MongoClient');

  const url = mongoMemoryServer.getUri();

  const client = new MongoClient(url, {
    monitorCommands: false,
  });
  client.on('commandStarted', (event) => {
    logger.debug(`commandStarted ${JSON.stringify(event.command, null, 2)}`);
  });
  client.on('commandFailed', (event) =>
    logger.debug(`commandFailed ${JSON.stringify(event, null, 2)}`),
  );

  client.on('commandSucceeded', (event) =>
    logger.debug(`commandSucceeeded ${JSON.stringify(event.reply, null, 2)}`),
  );

  client.on('connectionReady', (event) => {
    logger.log(`connected to ${event.address}`);
  });

  await client.connect();

  return client;
};
