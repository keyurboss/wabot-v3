import { Global, Module } from '@nestjs/common';
// import {
//   BullionSiteInfoRepoProvider,
//   GeneralUserRepoProvider,
//   GeneralUserReqRepoProvider,
// } from './repository.index';

const repositoryPorvider = [
  // GeneralUserRepoProvider,
  // BullionSiteInfoRepoProvider,
  // GeneralUserReqRepoProvider,
];

@Global()
@Module({
  providers: [...repositoryPorvider],
  exports: [...repositoryPorvider],
})
export class RepositoryModule {}
