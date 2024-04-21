import { Filter } from 'mongodb';
import { UserRoot } from '@rps/wabot-validator-roots';
import { CommonRepository } from './common/common-repo.interface';
import { UserId } from '@rps/wabot-interfaces';

export type UserFilter = Filter<UserRoot>;

export abstract class UserRepository extends CommonRepository<
  UserFilter,
  UserRoot,
  UserId
> {
  override rootName: string = UserRoot.name;
}
