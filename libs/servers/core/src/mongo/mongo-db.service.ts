import { Injectable } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

@Injectable()
export class MongoDbService {
  readonly db: Db;

  constructor(client: MongoClient) {
    this.db = client.db();
  }
}
