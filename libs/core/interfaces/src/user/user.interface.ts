import { Opaque } from 'ts-essentials';
import { IBase } from '../base.entity.interface';
export type UserId = Opaque<string, 'UserId'>;
export interface IUser extends IBase<UserId> {
  name: string;
  refNo: string;
  refId: string;
  expiresAt: Date;
  number: string;
  computeId: string;
}
