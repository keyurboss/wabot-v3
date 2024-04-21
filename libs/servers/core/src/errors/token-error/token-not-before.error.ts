import { ErrorCode } from '@rps/wabot-interfaces';
import { RESTApiReqError } from '../rest-api-req.error';
import { HttpStatus } from '@nestjs/common';

export class TokenNotBeforeError extends RESTApiReqError {
  constructor() {
    super(
      ErrorCode.TOKEN_NOT_BEFORE,
      'Token is for future use. You can not use it now.',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
