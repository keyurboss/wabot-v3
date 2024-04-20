import { Expose, Type, instanceToPlain } from 'class-transformer';
import { IsUUID } from 'class-validator';
import {
  groupDbToPlain,
  groupToPlain,
  validateSyncOrFail,
} from '../core.interface';
export class BaseEntity<T> {
  @Expose()
  @IsUUID()
  id!: T;

  @Expose()
  @Type(() => Date)
  createdAt: Date = new Date();

  @Expose()
  @Type(() => Date)
  modifiedAt: Date = new Date();

  toJson() {
    return instanceToPlain(this, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
      exposeDefaultValues: true,
      groups: [groupDbToPlain, groupToPlain],
    });
  }

  validate() {
    validateSyncOrFail(this);
  }
}
