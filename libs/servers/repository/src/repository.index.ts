import { Provider } from '@nestjs/common';
import {
  UserRepository
} from './interface';

import {
  UserMongoRepository
} from './mongo-repository';

export const UserRepoProvider: Provider = {
  provide: UserRepository,
  useClass: UserMongoRepository,
};
