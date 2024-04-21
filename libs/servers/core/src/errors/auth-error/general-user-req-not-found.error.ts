import { ErrorCode } from '@rps/wabot-interfaces';
import { RESTApiReqError } from '../rest-api-req.error';

export class GeneralUserReqNotFound extends RESTApiReqError {
  constructor() {
    super(ErrorCode.GENERAL_USER_REQ_NOT_FOUND, 'Request not found');
  }
}
