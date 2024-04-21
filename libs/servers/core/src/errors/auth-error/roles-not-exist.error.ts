import { ErrorCode } from '@rps/wabot-interfaces';
import { RESTApiReqError } from '../rest-api-req.error';
import { HttpStatus } from '@nestjs/common';

export class RolesNotExistsError extends RESTApiReqError {
  constructor() {
    super(
      ErrorCode.ROLE_NOT_EXISTS,
      'Your user has no roles',
      HttpStatus.FORBIDDEN,
    );
  }
}
