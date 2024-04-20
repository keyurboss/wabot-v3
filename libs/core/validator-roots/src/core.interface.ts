import { ValidatorOptions, validateSync } from 'class-validator';
import { ValidationError } from './core/validation.error';

export const groupToPlain = 'Group For Instance to Plain';
export const groupDbToPlain = 'Group For Db From Instance to Plan';
export const groupDbToInstance = 'Group For Db To Instance';

export function validateSyncOrFail<T extends object>(
  object: T,
  validatorOptions?: ValidatorOptions,
): asserts object is T {
  const errors = validateSync(object, validatorOptions);
  if (errors.length) {
    throw new ValidationError(errors);
  }
}
