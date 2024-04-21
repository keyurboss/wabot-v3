import { Global, Module } from '@nestjs/common';
import { UserRepoProvider } from './repository.index';
// import {
//   BullionSiteInfoRepoProvider,
//   GeneralUserRepoProvider,
//   GeneralUserReqRepoProvider,
// } from './repository.index';

const repositoryProvider = [
  UserRepoProvider,
  // BullionSiteInfoRepoProvider,
  // GeneralUserReqRepoProvider,
];

@Global()
@Module({
  providers: [...repositoryProvider],
  exports: [...repositoryProvider],
})
export class RepositoryModule {}
