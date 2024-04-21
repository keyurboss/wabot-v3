import { IBase } from '../base.entity.interface';
import { UserRoles } from './user-roles.enum';

export interface IBaseUser<T = string, Roles extends UserRoles = UserRoles>
  extends IBase<T> {
  role: Roles;
}
