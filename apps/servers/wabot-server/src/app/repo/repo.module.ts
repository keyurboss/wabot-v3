import { DynamicModule, Global, Module } from '@nestjs/common';
import { UserRepoProvider } from '@rps/wabot-repos';
import {
  FixturesMongoModule,
  MongoRepositoryLocalModule,
  MongoRepositoryProductionModule,
} from '@rps/wabot-server-core';
import { resolve } from 'path';
import { ServerAppModuleOptions } from '@rps/wabot-interfaces';

const repositoryPorvider = [UserRepoProvider];

@Global()
@Module({
  providers: [...repositoryPorvider],
  exports: [...repositoryPorvider],
})
class RepoServiceModule {}
@Global()
@Module({
  imports: [RepoServiceModule],
})
export class RepositoryModule {
  static register({ appEnv }: ServerAppModuleOptions): DynamicModule {
    let imports: DynamicModule['imports'] = [];
    switch (appEnv) {
      case 'ci':
      case 'local':
        imports = [
          ...imports,
          MongoRepositoryLocalModule,
          FixturesMongoModule.forRoot(resolve(__dirname, 'assets', 'fixtures')),
        ];
        break;
      case 'production':
        imports = [
          ...imports,
          // FixturesMongoModule.forRoot(resolve(__dirname, 'assets', 'fixtures')),
          MongoRepositoryProductionModule.forRoot({
            urlKey: 'DB_URL',
            tlsCaKey: 'DB_TLS_CA',
          }),
        ];
        break;
    }

    return {
      module: RepositoryModule,
      imports,
    };
  }
}
