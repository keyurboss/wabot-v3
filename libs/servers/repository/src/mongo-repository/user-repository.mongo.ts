import { Inject, OnModuleInit, Optional } from '@nestjs/common';
import { UserId } from '@rps/wabot-interfaces';
import { FixtureMongoService, LoggerFactory, MongoDbService } from '@rps/wabot-server-core';
import { UserOptions, UserRoot } from '@rps/wabot-validator-roots';
import { UserFilter, UserRepository } from '../interface';

export const generalUserCollection = 'GeneralUser';
export const GeneralUserSeedFileName = 'GeneralUserSeedFileName';

export type GeneralUserDocument = UserOptions & {
  _id: UserId;
};

export class UserMongoRepository
  extends UserRepository
  implements OnModuleInit
{
  private readonly collection;
  private readonly logger;

  constructor(
    @Inject(MongoDbService) { db }: MongoDbService,
    @Inject(LoggerFactory) loggerFactory: LoggerFactory,
    @Inject(FixtureMongoService)
    @Optional()
    private readonly fixtureService: FixtureMongoService,
    @Inject(GeneralUserSeedFileName)
    @Optional()
    private readonly fileName = 'user.data.json',
  ) {
    super();
    this.collection = db.collection<UserRoot>(generalUserCollection);
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async onModuleInit() {
    if (this.fixtureService !== null) {
      await this.fixtureService
        .seedFixtures(generalUserCollection, this.fileName)
        .catch((e) => {
          this.logger.error(e.message, e);
        });
    }
  }

  async find(filter?: UserFilter): Promise<UserRoot[]> {
    const cursor = filter
      ? this.collection.find(filter)
      : this.collection.find();
    const users = await cursor.toArray();
    return users.map((user) => UserRoot.fromJson(user));
  }

  async findByIds(ids: Array<UserId>): Promise<UserRoot[]> {
    const users = await this.collection
      .find({
        id: {
          $in: ids,
        },
      })
      .toArray();
    return users.map((user) => UserRoot.fromJson(user));
  }

  async findOne(id: UserId): Promise<UserRoot | undefined> {
    const user = await this.collection.findOne({
      id,
    });
    return typeof user !== 'undefined' && user !== null
      ? UserRoot.fromJson(user)
      : undefined;
  }

  async save(entity: UserRoot): Promise<void> {
    const data = entity.toJson();

    await this.collection.updateOne(
      { id: entity.id },
      { $set: data },
      { upsert: true },
    );

    this.logger.debug(
      `Persisted GeneralUser (${entity.id}): ${JSON.stringify(data)}`,
    );
  }
}
