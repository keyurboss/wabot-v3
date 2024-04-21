import { ErrorCode } from '@rps/wabot-interfaces';
import { RESTApiReqError } from '../rest-api-req.error';
import { HttpStatus } from '@nestjs/common';

export class TokenExpiredError extends RESTApiReqError {
  constructor() {
    super(
      ErrorCode.TOKEN_EXPIRED,
      'Token is Expired Please Pass Valid Token',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
